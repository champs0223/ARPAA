-- Criar tabela de eventos (se não existir)
CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  data DATE NOT NULL,
  horario TIME,
  local VARCHAR(255) NOT NULL,
  endereco VARCHAR(500),
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar índice para buscas por data
CREATE INDEX idx_data ON eventos(data);

-- Inserir eventos de exemplo (opcional)
-- INSERT INTO eventos (nome, data, horario, local, endereco, descricao) VALUES
-- ('Resgate no Bom Retiro', '2026-05-20', '14:30', 'Bom Retiro', 'Rua das Flores, 123', 'Resgate planejado de cães em situação de rua'),
-- ('Dia da Adoção', '2026-06-01', '10:00', 'Parque Central', 'Av. Paulista, 500', 'Grande evento de adoção com feirinha e conscientização');