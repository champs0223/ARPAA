-- ========================================
-- SCRIPT DE CRIAÇÃO DO BANCO ARPAA (RAILWAY)
-- ========================================
-- Executar como: mysql -u root -p railway < create-schema-railway.sql
-- Ou copiar e colar todo o conteúdo no client MySQL

USE `railway`;

-- ========================================
-- TABELA 1: USUÁRIOS (tabela base, sem FK)
-- ========================================
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `cpf` VARCHAR(32) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  `is_admin` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_cpf` (`cpf`),
  INDEX `idx_usuarios_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA 2: ANIMAIS (FK para usuários)
-- ========================================
CREATE TABLE IF NOT EXISTS `animais` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `especie` VARCHAR(100),
  `raca` VARCHAR(100),
  `sexo` VARCHAR(50) DEFAULT 'desconhecido',
  `idade_aproximada` VARCHAR(100),
  `porte` VARCHAR(100) DEFAULT 'desconhecido',
  `data_resgate` DATE,
  `local_resgate` VARCHAR(255),
  `status` VARCHAR(100) DEFAULT 'resgatado',
  `descricao` TEXT,
  `foto_url` TEXT,
  `registrado_por` INT UNSIGNED,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- SAÚDE (Booleanos)
  `vacinado` ENUM('Sim', 'Não', '') DEFAULT '',
  `castrado` ENUM('Sim', 'Não', '') DEFAULT '',
  `vermifugado` ENUM('Sim', 'Não', '') DEFAULT '',
  -- COMPORTAMENTO (Booleanos e texto)
  `temperamento` VARCHAR(100),
  `convive_criancas` ENUM('Sim', 'Não', '') DEFAULT '',
  `convive_animais` ENUM('Sim', 'Não', '') DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `idx_animais_registrado_por` (`registrado_por`),
  KEY `idx_animais_status` (`status`),
  KEY `idx_animais_created_at` (`created_at`),
  CONSTRAINT `fk_animais_usuarios` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA 3: ADOTANTES (tabela base, sem FK)
-- ========================================
CREATE TABLE IF NOT EXISTS `adotantes` (
  `id` CHAR(12) NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255),
  `telefone` VARCHAR(100),
  `endereco` VARCHAR(255),
  `complemento` VARCHAR(255),
  `cidade` VARCHAR(100),
  `estado` VARCHAR(100),
  `cpf` VARCHAR(32),
  `idade` INT UNSIGNED,
  -- CRITÉRIOS DE ADOÇÃO (Booleanos)
  `trabalha` ENUM('Sim', 'Não', '') DEFAULT '',
  `tem_criancas` ENUM('Sim', 'Não', '') DEFAULT '',
  `tem_pets` ENUM('Sim', 'Não', '') DEFAULT '',
  `tem_quintal` ENUM('Sim', 'Não', '') DEFAULT '',
  `observacoes` TEXT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_adotantes_cpf` (`cpf`),
  INDEX `idx_adotantes_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA 4: ADOÇÕES (FK para animais e adotantes)
-- ========================================
CREATE TABLE IF NOT EXISTS `adocoes` (
  `id` CHAR(12) NOT NULL,
  `animal_id` INT UNSIGNED NOT NULL,
  `adotante_id` CHAR(12) NOT NULL,
  `data_adocao` DATE,
  `status` VARCHAR(100),
  PRIMARY KEY (`id`),
  KEY `idx_adocoes_animal_id` (`animal_id`),
  KEY `idx_adocoes_adotante_id` (`adotante_id`),
  KEY `idx_adocoes_status` (`status`),
  CONSTRAINT `fk_adocoes_animais` FOREIGN KEY (`animal_id`) REFERENCES `animais` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_adocoes_adotantes` FOREIGN KEY (`adotante_id`) REFERENCES `adotantes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA 5: VACINAS (FK para animais)
-- ========================================
CREATE TABLE IF NOT EXISTS `vacinas` (
  `id` CHAR(12) NOT NULL,
  `animal_id` INT UNSIGNED NOT NULL,
  `nome_vacina` VARCHAR(255),
  `data_aplicacao` DATE,
  `validade` DATE,
  `veterinario_id` INT UNSIGNED,
  PRIMARY KEY (`id`),
  KEY `idx_vacinas_animal_id` (`animal_id`),
  KEY `idx_vacinas_data_aplicacao` (`data_aplicacao`),
  CONSTRAINT `fk_vacinas_animais` FOREIGN KEY (`animal_id`) REFERENCES `animais` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA 6: TRATAMENTOS (FK para animais)
-- ========================================
CREATE TABLE IF NOT EXISTS `tratamentos` (
  `id` CHAR(12) NOT NULL,
  `animal_id` INT UNSIGNED NOT NULL,
  `tipo_tratamento` VARCHAR(255),
  `data_inicio` DATE,
  `data_termino` DATE,
  `veterinario_id` INT UNSIGNED,
  PRIMARY KEY (`id`),
  KEY `idx_tratamentos_animal_id` (`animal_id`),
  KEY `idx_tratamentos_data_inicio` (`data_inicio`),
  CONSTRAINT `fk_tratamentos_animais` FOREIGN KEY (`animal_id`) REFERENCES `animais` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA 7: RESGATES (FK para animais)
-- ========================================
CREATE TABLE IF NOT EXISTS `resgates` (
  `id` CHAR(12) NOT NULL,
  `animal_id` INT UNSIGNED NOT NULL,
  `local_resgate` VARCHAR(255),
  `data_resgate` DATE,
  `responsavel_id` INT UNSIGNED,
  PRIMARY KEY (`id`),
  KEY `idx_resgates_animal_id` (`animal_id`),
  KEY `idx_resgates_data_resgate` (`data_resgate`),
  CONSTRAINT `fk_resgates_animais` FOREIGN KEY (`animal_id`) REFERENCES `animais` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELA 8: HISTÓRICO DE ANIMAIS
-- (FK para animais e usuários)
-- ========================================
CREATE TABLE IF NOT EXISTS `historico_animal` (
  `id` CHAR(12) NOT NULL,
  `animal_id` INT UNSIGNED NOT NULL,
  `tipo_evento` VARCHAR(255),
  `descricao` TEXT,
  `usuario_id` INT UNSIGNED,
  `data_evento` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_historico_animal_animal_id` (`animal_id`),
  KEY `idx_historico_animal_usuario_id` (`usuario_id`),
  KEY `idx_historico_animal_data_evento` (`data_evento`),
  CONSTRAINT `fk_historico_animal_animais` FOREIGN KEY (`animal_id`) REFERENCES `animais` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_historico_animal_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- RESUMO DE ESTRUTURA
-- ========================================
-- Tabelas criadas:
-- 1. usuarios (id, nome, cpf, senha) - BASE
-- 2. animais com saúde e comportamento
-- 3. adotantes com critérios de adoção
-- 4. adocoes (FK: animal_id, adotante_id)
-- 5. vacinas (FK: animal_id)
-- 6. tratamentos (FK: animal_id)
-- 7. resgates (FK: animal_id)
-- 8. historico_animal (FK: animal_id, usuario_id)
-- ========================================
