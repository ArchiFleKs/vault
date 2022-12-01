package useragent

import (
	"fmt"
	"runtime"
	"strings"

	"github.com/hashicorp/vault/sdk/logical"
)

var (
	// projectURL is the project URL.
	projectURL = "https://www.vaultproject.io/"

	// rt is the runtime - variable for tests.
	rt = runtime.Version()
)

// PluginString is usable by plugins to return a user-agent string reflecting
// the running Vault version and an optional plugin name.
//
// e.g. Vault/0.10.4 (+https://www.vaultproject.io/; azure-auth; go1.10.1)
//
// Given comments will be appended to the semicolon-delimited comment section.
//
// e.g. Vault/0.10.4 (+https://www.vaultproject.io/; azure-auth; go1.10.1; comment-0; comment-1)
//
// Returns an empty string if the given env is nil.
func PluginString(env *logical.PluginEnvironment, pluginName string, comments ...string) string {
	if env == nil {
		return ""
	}

	// Construct comments
	c := []string{"+" + projectURL}
	if pluginName != "" {
		c = append(c, pluginName)
	}
	c = append(c, rt)
	c = append(c, comments...)

	// Construct version string
	v := env.VaultVersion
	if env.VaultVersionPrerelease != "" {
		v = fmt.Sprintf("%s-%s", v, env.VaultVersionPrerelease)
	}
	if env.VaultVersionMetadata != "" {
		v = fmt.Sprintf("%s+%s", v, env.VaultVersionMetadata)
	}

	return fmt.Sprintf("Vault/%s (%s)", v, strings.Join(c, "; "))
}
