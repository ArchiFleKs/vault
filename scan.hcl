repository {
  go_modules = true
  osv = true
  secrets {
    all = true
  } 
  dependabot {
    required = true
    check_config = true
  }
  
  plugin "semgrep" {
    use_git_ignore = true
    exclude = ["vendor"]
    config = ["tools/semgrep/ci", "p/r2c-security-audit"]
  }
  
  plugin "codeql" {
    languages = ["go"]
  }
}