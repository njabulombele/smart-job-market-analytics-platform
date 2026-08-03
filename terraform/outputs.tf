output "postgres_host" {
  description = "PostgreSQL server hostname"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "redis_host" {
  description = "Redis cache hostname"
  value       = azurerm_redis_cache.main.hostname
}

output "acr_login_server" {
  description = "Azure Container Registry login server"
  value       = azurerm_container_registry.main.login_server
}

output "aks_cluster_name" {
  description = "AKS cluster name"
  value       = azurerm_kubernetes_cluster.main.name
}

output "key_vault_uri" {
  description = "Key Vault URI"
  value       = azurerm_key_vault.main.vault_uri
}

output "storage_account_name" {
  description = "Blob storage account name"
  value       = azurerm_storage_account.main.name
}
