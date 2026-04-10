-- ========================================
-- SEED: Usuário Admin Padrão
-- ========================================
-- Execute este arquivo após criar o schema para inserir o usuário admin

USE `railway`;

-- Inserir usuário admin
INSERT IGNORE INTO `usuarios` (id, nome, cpf, senha, is_admin) 
VALUES (1, 'admin', '00000000000000', '1234', 1);

-- Verificação
SELECT 'Usuário admin insertado/existente:' as status;
SELECT id, nome, cpf, is_admin FROM usuarios WHERE nome = 'admin';
