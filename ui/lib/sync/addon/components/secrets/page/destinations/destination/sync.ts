/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { keyIsFolder } from 'core/utils/key-utils';
import errorMessage from 'vault/utils/error-message';

import type SyncDestinationModel from 'vault/models/sync/destination';
import type RouterService from '@ember/routing/router-service';
import type StoreService from 'vault/services/store';
import type FlashMessageService from 'vault/services/flash-messages';
import type { SearchSelectOption } from 'vault/vault/app-types';

interface Args {
  destination: SyncDestinationModel;
}

export default class DestinationSyncPageComponent extends Component<Args> {
  @service declare readonly router: RouterService;
  @service declare readonly store: StoreService;
  @service declare readonly flashMessages: FlashMessageService;

  constructor(owner: unknown, args: Args) {
    super(owner, args);
    this.fetchMounts();
  }

  @tracked mounts: SearchSelectOption[] = [];
  @tracked mountPath = '';
  @tracked secretPath = '';
  @tracked error = '';
  @tracked syncedSecret = '';

  get isSecretDirectory() {
    return this.secretPath && keyIsFolder(this.secretPath);
  }

  get isSubmitDisabled() {
    return !this.mountPath || !this.secretPath || this.isSecretDirectory || this.setAssociation.isRunning;
  }

  willDestroy(): void {
    this.store.clearDataset('sync/association');
    super.willDestroy();
  }

  // unable to use built-in fetch functionality of SearchSelect since we need to filter by kv type
  async fetchMounts() {
    try {
      const secretEngines = await this.store.query('secret-engine', {});
      this.mounts = secretEngines.reduce((filtered, model) => {
        if (model.type === 'kv' && model.version === 2) {
          filtered.push({ name: model.path, id: model.path });
        }
        return filtered;
      }, []);
    } catch (error) {
      // the user is still able to manually enter the mount path
      // InputSearch component will render in this case
    }
  }

  @action
  back() {
    this.router.transitionTo('vault.cluster.sync.secrets.destinations.destination.secrets');
  }

  @action
  setMount(selected: Array<string>) {
    this.mountPath = selected[0] || '';
  }

  setAssociation = task({}, async (event: Event) => {
    event.preventDefault();
    try {
      this.syncedSecret = '';
      const { name: destinationName, type: destinationType } = this.args.destination;
      const mount = keyIsFolder(this.mountPath) ? this.mountPath.slice(0, -1) : this.mountPath; // strip trailing slash from mount path
      const association = this.store.createRecord('sync/association', {
        destinationName,
        destinationType,
        mount,
        secretName: this.secretPath,
      });
      await association.save({ adapterOptions: { action: 'set' } });
      this.syncedSecret = this.secretPath;
    } catch (error) {
      this.error = `Sync operation error: \n ${errorMessage(error)}`;
    }
  });
}