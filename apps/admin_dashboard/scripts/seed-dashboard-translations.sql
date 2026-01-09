-- Dashboard namespace translations (English)
INSERT INTO translations (languageCode, namespace, `key`, value, createdAt, updatedAt) VALUES
('en', 'dashboard', 'title', 'Dashboard', NOW(), NOW()),
('en', 'dashboard', 'welcome_message', 'Welcome to your admin dashboard', NOW(), NOW()),
('en', 'dashboard', 'total_orders', 'Total Orders', NOW(), NOW()),
('en', 'dashboard', 'active_users', 'Active Users', NOW(), NOW()),
('en', 'dashboard', 'active_riders', 'Active Riders', NOW(), NOW()),
('en', 'dashboard', 'total_revenue', 'Total Revenue', NOW(), NOW()),
('en', 'dashboard', 'from_last_month', 'from last month', NOW(), NOW()),
('en', 'dashboard', 'recent_orders', 'Recent Orders', NOW(), NOW()),
('en', 'dashboard', 'recent_orders_description', 'Latest orders from your customers', NOW(), NOW()),
('en', 'dashboard', 'manage_products', 'Manage Products', NOW(), NOW()),
('en', 'dashboard', 'manage_products_description', 'Add, edit, and organize your product catalog', NOW(), NOW()),
('en', 'dashboard', 'approve_riders', 'Approve Riders', NOW(), NOW()),
('en', 'dashboard', 'approve_riders_description', 'Review and approve pending rider applications', NOW(), NOW()),
('en', 'dashboard', 'view_analytics', 'View Analytics', NOW(), NOW()),
('en', 'dashboard', 'view_analytics_description', 'Track performance metrics and insights', NOW(), NOW())
ON DUPLICATE KEY UPDATE value = VALUES(value), updatedAt = NOW();

-- Dashboard namespace translations (French)
INSERT INTO translations (languageCode, namespace, `key`, value, createdAt, updatedAt) VALUES
('fr', 'dashboard', 'title', 'Tableau de bord', NOW(), NOW()),
('fr', 'dashboard', 'welcome_message', 'Bienvenue sur votre tableau de bord administrateur', NOW(), NOW()),
('fr', 'dashboard', 'total_orders', 'Total des commandes', NOW(), NOW()),
('fr', 'dashboard', 'active_users', 'Utilisateurs actifs', NOW(), NOW()),
('fr', 'dashboard', 'active_riders', 'Livreurs actifs', NOW(), NOW()),
('fr', 'dashboard', 'total_revenue', 'Revenu total', NOW(), NOW()),
('fr', 'dashboard', 'from_last_month', 'du mois dernier', NOW(), NOW()),
('fr', 'dashboard', 'recent_orders', 'Commandes récentes', NOW(), NOW()),
('fr', 'dashboard', 'recent_orders_description', 'Dernières commandes de vos clients', NOW(), NOW()),
('fr', 'dashboard', 'manage_products', 'Gérer les produits', NOW(), NOW()),
('fr', 'dashboard', 'manage_products_description', 'Ajouter, modifier et organiser votre catalogue de produits', NOW(), NOW()),
('fr', 'dashboard', 'approve_riders', 'Approuver les livreurs', NOW(), NOW()),
('fr', 'dashboard', 'approve_riders_description', 'Examiner et approuver les candidatures de livreurs en attente', NOW(), NOW()),
('fr', 'dashboard', 'view_analytics', 'Voir les analyses', NOW(), NOW()),
('fr', 'dashboard', 'view_analytics_description', 'Suivre les métriques de performance et les insights', NOW(), NOW())
ON DUPLICATE KEY UPDATE value = VALUES(value), updatedAt = NOW();
