/**
 * Inicializador de Dados Locais - Sistema de Banco de Dados Local
 * Popula dados de teste no IndexedDB e localStorage
 */

async function inicializarDadosLocais() {
  console.log('🔄 Inicializando dados locais...');
  
  try {
    // Aguardar DB estar pronto
    const db = await new Promise((resolve) => {
      const check = setInterval(() => {
        if (window.dbLocal?.db) {
          clearInterval(check);
          resolve(window.dbLocal);
        }
      }, 100);
    });

    // =================== USUÁRIOS (localStorage) ===================
    let usuariosExistentes = localStorage.getItem('usuarios_app');
    if (!usuariosExistentes) {
      const usuariosPadrao = [
        {
          id: 1,
          usuario: 'admin',
          senha: 'admin123',
          nome: 'Administrador ARPAA',
          email: 'admin@arpaa.com.br',
          is_admin: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          usuario: 'voluntario',
          senha: 'vol123',
          nome: 'Voluntário ARPAA',
          email: 'voluntario@arpaa.com.br',
          is_admin: false,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          usuario: 'amim12',
          senha: 'amim123',
          nome: 'Usuário Meu',
          email: 'amim@arpaa.com.br',
          is_admin: true,
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem('usuarios_app', JSON.stringify(usuariosPadrao));
      console.log('✅ Usuários criados:');
      console.log('   admin / admin123');
      console.log('   voluntario / vol123');
      console.log('   amim12 / amim123 (SEU USUÁRIO)');
    }

    // =================== ANIMAIS (IndexedDB) ===================
    const animaisExistentes = await db.getAll('animais');
    if (animaisExistentes.length === 0) {
      const animalsPadrao = [
        {
          id: 1,
          nome: 'Rex',
          especie: 'Cachorro',
          raca: 'Labrador',
          idade: 3,
          genero: 'M',
          porte: 'Grande',
          descricao: 'Cachorro dócil e brincalhão, ótimo com crianças',
          status: 'disponivel',
          data_resgate: '2024-01-15',
          foto: null,
          registrado_por: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          nome: 'Mia',
          especie: 'Gato',
          raca: 'Siamês',
          idade: 2,
          genero: 'F',
          porte: 'Pequeno',
          descricao: 'Gatinha carinhosa e independente',
          status: 'disponivel',
          data_resgate: '2024-02-20',
          foto: null,
          registrado_por: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          nome: 'Bolinha',
          especie: 'Cachorro',
          raca: 'Poodle',
          idade: 5,
          genero: 'F',
          porte: 'Pequeno',
          descricao: 'Doce e companheira',
          status: 'adotado',
          data_resgate: '2023-12-01',
          foto: null,
          registrado_por: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          nome: 'Simba',
          especie: 'Gato',
          raca: 'Persa',
          idade: 1,
          genero: 'M',
          porte: 'Pequeno',
          descricao: 'Filhote brincalhão',
          status: 'disponivel',
          data_resgate: '2024-03-10',
          foto: null,
          registrado_por: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      for (const animal of animalsPadrao) {
        await db.put('animais', animal);
      }
      console.log('✅ 4 animais de teste criados');
    }

    // =================== ADOTANTES (IndexedDB) ===================
    const adotantesExistentes = await db.getAll('adotantes');
    if (adotantesExistentes.length === 0) {
      const adotantesPadrao = [
        {
          id: 1,
          nome: 'João Silva',
          email: 'joao@email.com',
          telefone: '11999999999',
          cpf: '123.456.789-00',
          endereco: 'Rua A, 100',
          cidade: 'São Paulo',
          estado: 'SP',
          status: 'ativo',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          nome: 'Maria Santos',
          email: 'maria@email.com',
          telefone: '11998888888',
          cpf: '987.654.321-00',
          endereco: 'Avenida B, 200',
          cidade: 'São Paulo',
          estado: 'SP',
          status: 'ativo',
          created_at: new Date().toISOString()
        }
      ];

      for (const adotante of adotantesPadrao) {
        await db.put('adotantes', adotante);
      }
      console.log('✅ 2 adotantes de teste criados');
    }

    // =================== ADOÇÕES (IndexedDB) ===================
    const adocoesExistentes = await db.getAll('adocoes');
    if (adocoesExistentes.length === 0) {
      const adocoesPadrao = [
        {
          id: 1,
          animal_id: 3,
          adotante_id: 1,
          data_adocao: '2024-03-01',
          status: 'concluida',
          observacoes: 'Adoção bem-sucedida',
          created_at: new Date().toISOString()
        }
      ];

      for (const adocao of adocoesPadrao) {
        await db.put('adocoes', adocao);
      }
      console.log('✅ Adoções de teste criadas');
    }

    console.log('✅ ✅ ✅ Banco de dados local inicializado com sucesso!');
    console.log('📝 Dados de teste criados - Experimente logar com:');
    console.log('   Usuário: admin');
    console.log('   Senha: admin123');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar dados locais:', error);
  }
}

// Executar inicialização quando página carregar
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(inicializarDadosLocais, 500);
});

// Também chamar ao carregar scripts
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarDadosLocais);
} else {
  setTimeout(inicializarDadosLocais, 500);
}
