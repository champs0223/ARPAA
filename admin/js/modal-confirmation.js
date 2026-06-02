/**
 * SISTEMA CENTRALIZADO DE MODAIS DE CONFIRMAÇÃO
 * Fornece uma interface reutilizável e consistente para ações críticas
 * 
 * Uso:
 *   openConfirmationModal({
 *     title: 'Confirmar exclusão',
 *     message: 'Tem certeza que deseja excluir este item?',
 *     confirmText: 'Sim, Excluir',
 *     cancelText: 'Cancelar',
 *     type: 'delete',
 *     onConfirm: () => { ... },
 *     onCancel: () => { ... }
 *   })
 */

class ConfirmationModal {
  constructor() {
    this.modalElement = null;
    this.currentCallback = null;
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.createModalHTML();
        this.attachEventListeners();
      }, { once: true });
    } else {
      this.createModalHTML();
      this.attachEventListeners();
    }
  }

  createModalHTML() {
    if (document.getElementById('global-confirmation-modal')) {
      this.modalElement = document.getElementById('global-confirmation-modal');
      return;
    }

    const root = document.body || document.documentElement;
    if (!root) {
      console.error('ConfirmationModal: DOM root não encontrado. Aguardando carregamento.');
      return;
    }

    const modalHTML = `
      <div id="global-confirmation-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-200">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div id="modal-icon" class="w-10 h-10 rounded-full flex items-center justify-center text-2xl"></div>
              <h2 id="modal-title" class="text-xl font-bold text-gray-900"></h2>
            </div>
            <button onclick="window.confirmationModal.close()" class="text-gray-400 hover:text-gray-600 transition">
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>

          <!-- Message -->
          <div class="p-6">
            <p id="modal-message" class="text-gray-600 leading-relaxed"></p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 p-6 border-t border-gray-100">
            <button 
              onclick="window.confirmationModal.close()" 
              class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition duration-200">
              <span id="modal-cancel-text">Cancelar</span>
            </button>
            <button 
              id="modal-confirm-btn" 
              class="flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition duration-200"
              onclick="window.confirmationModal.confirm()">
              <span id="modal-confirm-text">Confirmar</span>
            </button>
          </div>

          <!-- Info Footer (opcional) -->
          <div id="modal-footer" class="hidden px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
            <p id="modal-footer-text" class="text-xs text-gray-600 text-center"></p>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modalElement = document.getElementById('global-confirmation-modal');
  }

  attachEventListeners() {
    // Fechar ao clicar fora (backdrop)
    this.modalElement?.addEventListener('click', (e) => {
      if (e.target === this.modalElement) {
        this.close();
      }
    });

    // Fechar ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modalElement.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  open(options = {}) {
    const {
      title = 'Confirmar ação',
      message = 'Tem certeza que deseja prosseguir?',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      type = 'default', // 'delete', 'approve', 'reject', 'finalize', 'default'
      onConfirm = () => {},
      onCancel = () => {},
      footerText = null,
      confirmButtonDisabled = false
    } = options;

    // Define o estilo baseado no tipo
    const styles = {
      delete: {
        icon: '<i class="fas fa-trash text-red-500"></i>',
        bgColor: 'bg-red-600 hover:bg-red-700'
      },
      approve: {
        icon: '<i class="fas fa-check text-green-500"></i>',
        bgColor: 'bg-green-600 hover:bg-green-700'
      },
      reject: {
        icon: '<i class="fas fa-times text-red-500"></i>',
        bgColor: 'bg-red-600 hover:bg-red-700'
      },
      finalize: {
        icon: '<i class="fas fa-check-double text-blue-500"></i>',
        bgColor: 'bg-blue-600 hover:bg-blue-700'
      },
      default: {
        icon: '<i class="fas fa-question-circle text-yellow-500"></i>',
        bgColor: 'bg-blue-600 hover:bg-blue-700'
      }
    };

    const style = styles[type] || styles.default;

    // Preenche o conteúdo do modal
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('modal-icon').innerHTML = style.icon;
    document.getElementById('modal-confirm-text').textContent = confirmText;
    document.getElementById('modal-cancel-text').textContent = cancelText;

    // Atualiza o botão de confirmação
    const confirmBtn = document.getElementById('modal-confirm-btn');
    confirmBtn.className = `flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition duration-200 ${style.bgColor}`;
    confirmBtn.disabled = confirmButtonDisabled;

    // Footer (se fornecido)
    if (footerText) {
      const footer = document.getElementById('modal-footer');
      document.getElementById('modal-footer-text').textContent = footerText;
      footer.classList.remove('hidden');
    } else {
      document.getElementById('modal-footer').classList.add('hidden');
    }

    // Armazena callbacks
    this.currentCallback = {
      onConfirm: onConfirm,
      onCancel: onCancel
    };

    // Mostra o modal
    this.modalElement.classList.remove('hidden');
    // Animação suave
    setTimeout(() => {
      this.modalElement.querySelector('.bg-white').style.transform = 'scale(1)';
    }, 0);
  }

  confirm() {
    const callback = this.currentCallback
    this.currentCallback = null
    if (callback?.onConfirm) {
      callback.onConfirm();
    }
    this.modalElement.classList.add('hidden');
  }

  close() {
    if (this.currentCallback?.onCancel) {
      this.currentCallback.onCancel();
    }
    this.modalElement.classList.add('hidden');
    this.currentCallback = null;
  }
}

// Instancia global do modal
window.confirmationModal = new ConfirmationModal();

/**
 * Funções auxiliares atalho para casos comuns
 */

// Confirmação de exclusão
function confirmDelete(itemName, onConfirm, onCancel) {
  window.confirmationModal.open({
    type: 'delete',
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir permanentemente "${itemName}"? Esta ação não pode ser desfeita.`,
    confirmText: 'Sim, Excluir',
    cancelText: 'Cancelar',
    footerText: '⚠️ Esta ação é irreversível',
    onConfirm,
    onCancel
  });
}

// Confirmação de aprovação
function confirmApprove(itemName, onConfirm, onCancel) {
  window.confirmationModal.open({
    type: 'approve',
    title: 'Confirmar aprovação',
    message: `Tem certeza que deseja APROVAR "${itemName}"?`,
    confirmText: 'Sim, Aprovar',
    cancelText: 'Cancelar',
    onConfirm,
    onCancel
  });
}

// Confirmação de rejeição
function confirmReject(itemName, onConfirm, onCancel) {
  window.confirmationModal.open({
    type: 'reject',
    title: 'Confirmar rejeição',
    message: `Tem certeza que deseja REJEITAR "${itemName}"?`,
    confirmText: 'Sim, Rejeitar',
    cancelText: 'Cancelar',
    onConfirm,
    onCancel
  });
}

// Confirmação de finalização
function confirmFinalize(itemName, onConfirm, onCancel) {
  window.confirmationModal.open({
    type: 'finalize',
    title: 'Confirmar finalização',
    message: `Tem certeza que deseja FINALIZAR "${itemName}"? Depois de concluído, o processo não poderá mais ser alterado.`,
    confirmText: 'Sim, Finalizar',
    cancelText: 'Cancelar',
    footerText: '⚠️ Ação irreversível - processo será bloqueado após conclusão',
    onConfirm,
    onCancel
  });
}

// Confirmação customizada
function confirmCustom(title, message, confirmText, onConfirm, onCancel, options = {}) {
  window.confirmationModal.open({
    title,
    message,
    confirmText,
    onConfirm,
    onCancel,
    ...options
  });
}

console.log('✅ Modal Confirmation System carregado');
