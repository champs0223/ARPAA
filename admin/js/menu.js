var paginaAtual = window.location.pathname.split("/").pop()

function isAdminUser() {
  return localStorage.getItem('usuarioAdmin') === 'true'
}

function getCurrentUserName() {
  return localStorage.getItem('nome') || localStorage.getItem('usuarioNome') || sessionStorage.getItem('nome') || sessionStorage.getItem('usuarioNome') || ''
}

function renderUserGreeting() {
  const aside = document.querySelector('aside')
  if (!aside) return
  if (document.getElementById('user-greeting')) return

  const nome = getCurrentUserName()
  if (!nome) return

  const greeting = document.createElement('div')
  greeting.id = 'user-greeting'
  greeting.className = 'px-6 pb-4 text-sm text-slate-600'
  greeting.innerHTML = `
    <p class="text-slate-500">Olá,</p>
    <p class="font-semibold text-slate-800">${nome}</p>
  `

  const logoBlock = aside.querySelector('div')
  if (logoBlock) {
    logoBlock.insertAdjacentElement('afterend', greeting)
  } else {
    aside.insertAdjacentElement('afterbegin', greeting)
  }
}

function logout() {
  const keys = ['adminLogado', 'usuarioId', 'usuarioNome', 'usuarioAdmin', 'adminToken']
  keys.forEach(key => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
  window.location.href = 'index.html'
}

window.logout = logout

function injectAdminMenuItems() {
  if (!isAdminUser()) return

  const menuList = document.querySelector('aside nav ul')
  if (!menuList) return

  if (!document.getElementById('menuKPIs')) {
    const kpisItem = document.createElement('li')
    kpisItem.innerHTML = `
      <a id="menuKPIs" href="kpis.html" class="menu-link flex gap-3 hover:text-yellow-300">
        <i class="fas fa-chart-pie"></i>
        KPIs
      </a>
    `

    const animaisLink = document.getElementById('menuAnimais')
    if (animaisLink && animaisLink.parentNode) {
      menuList.insertBefore(kpisItem, animaisLink.parentNode)
    } else {
      menuList.appendChild(kpisItem)
    }
  }

  if (!document.getElementById('menuUsuarios')) {
    const usuariosItem = document.createElement('li')
    usuariosItem.innerHTML = `
      <a id="menuUsuarios" href="usuarios.html" class="menu-link flex gap-3 hover:text-yellow-300">
        <i class="fas fa-users"></i>
        Usuários
      </a>
    `

    const animaisLink = document.getElementById('menuAnimais')
    if (animaisLink && animaisLink.parentNode) {
      menuList.insertBefore(usuariosItem, animaisLink.parentNode)
    } else {
      menuList.appendChild(usuariosItem)
    }
  }

  if (!document.getElementById('menuContatos')) {
    const contatosItem = document.createElement('li')
    contatosItem.innerHTML = `
      <a id="menuContatos" href="contatos.html" class="menu-link flex gap-3 hover:text-yellow-300">
        <i class="fas fa-envelope"></i>
        Contatos
      </a>
    `

    const eventosLink = document.getElementById('menuEventos')
    if (eventosLink && eventosLink.parentNode) {
      menuList.insertBefore(contatosItem, eventosLink.parentNode)
    } else {
      menuList.appendChild(contatosItem)
    }
  }
}

function activateCurrentMenuLink() {
  const links = document.querySelectorAll(".menu-link")
  links.forEach(link => {
    if (link.getAttribute("href") === paginaAtual) {
      link.classList.add("text-yellow-300", "menu-ativo")
    }
  })
}

function toggleMenu(){
  const submenu = document.getElementById("submenuAdocoes")
  const seta = document.getElementById("iconeSeta")

  submenu.classList.toggle("hidden")
  seta.classList.toggle("rotate-180")
}

document.addEventListener('DOMContentLoaded', () => {
  if (paginaAtual === "adocoes.html" || paginaAtual === "adotantes.html" || paginaAtual === "solicitacoes.html") {
    const submenu = document.getElementById("submenuAdocoes")
    const seta = document.getElementById("iconeSeta")
    if (submenu) submenu.classList.remove("hidden")
    if (seta) seta.classList.add("rotate-180")
  }

  injectAdminMenuItems()
  renderUserGreeting()
  activateCurrentMenuLink()
  initializeAdminNotifications()
})

async function initializeAdminNotifications() {
  setupSolicitacoesBadge()
  setupHeaderBell()
  setupToastContainer()

  try {
    await loadSocketIoClient()
    const socket = connectAdminSocket()
    if (socket) {
      socket.on('novaSolicitacao', handleNovaSolicitacao)
    }
  } catch (error) {
    console.warn('Falha ao carregar Socket.IO:', error)
  }
}

function setupSolicitacoesBadge() {
  const menuLink = document.getElementById('menuSolicitacoes')
  if (!menuLink) return

  const existingBadge = document.getElementById('badge-solicitacoes')
  if (existingBadge) return

  // Garantir que o link seja um container flex para posicionar o badge corretamente
  if (!menuLink.classList.contains('flex')) {
    menuLink.classList.add('flex', 'items-center')
  }

  const badge = document.createElement('span')
  badge.id = 'badge-solicitacoes'
  badge.className = 'hidden inline-block w-2.5 h-2.5 bg-red-500 rounded-full ml-auto'
  badge.setAttribute('aria-label', 'Notificações de solicitações')
  menuLink.appendChild(badge)
}

function setupHeaderBell() {
  const header = document.querySelector('main .flex.justify-between.items-center, main .flex.justify-between')
  if (!header || document.getElementById('notification-bell')) return

  const button = document.createElement('button')
  button.id = 'notification-bell'
  button.type = 'button'
  button.className = 'relative flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm hover:shadow-md transition text-gray-700'
  button.innerHTML = `
    <i class="fas fa-bell text-gray-600"></i>
    <span class="text-sm font-semibold">Notificações</span>
    <span id="notification-count" class="hidden absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-[10px] text-white font-bold">!</span>
  `
  button.addEventListener('click', () => {
    toggleNotificationsDrawer()
  })
  header.appendChild(button)
}

// Adicionar comportamento e gaveta de notificações
function ensureNotificationsDrawer() {
  if (document.getElementById('notifications-drawer')) return

  const drawer = document.createElement('div')
  drawer.id = 'notifications-drawer'
  drawer.className = 'fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-60 transform translate-x-full transition-transform'
  drawer.innerHTML = `
    <div class="p-4 border-b flex items-center justify-between">
      <h3 class="font-semibold">Notificações</h3>
      <button id="close-notifications" class="text-gray-500 hover:text-gray-700">Fechar</button>
    </div>
    <div id="notifications-list" class="p-4 overflow-y-auto h-[calc(100%-64px)] space-y-3">
      <p class="text-sm text-gray-500">Nenhuma notificação</p>
    </div>
  `
  document.body.appendChild(drawer)

  document.getElementById('close-notifications').addEventListener('click', () => {
    drawer.classList.add('translate-x-full')
  })
}

function toggleNotificationsDrawer() {
  ensureNotificationsDrawer()
  const drawer = document.getElementById('notifications-drawer')
  if (!drawer) return

  const badge = document.getElementById('badge-solicitacoes')
  const count = document.getElementById('notification-count')
  if (drawer.classList.contains('translate-x-full')) {
    drawer.classList.remove('translate-x-full')
    if (badge) badge.classList.add('hidden')
    if (count) count.classList.add('hidden')
  } else {
    drawer.classList.add('translate-x-full')
  }
}

function pushAdminNotification(payload) {
  window.adminNotifications = window.adminNotifications || []
  window.adminNotifications.push(payload)
  renderNotificationsList()
}

function renderNotificationsList() {
  const list = document.getElementById('notifications-list')
  if (!list) return
  const items = (window.adminNotifications || []).slice().reverse()
  if (items.length === 0) {
    list.innerHTML = '<p class="text-sm text-gray-500">Nenhuma notificação</p>'
    return
  }

  list.innerHTML = items.map(n => `
    <div class="p-3 bg-slate-50 rounded-lg border">
      <p class="text-sm font-semibold">${(n.titulo) ? n.titulo : 'Nova notificação'}</p>
      <p class="text-sm text-gray-600">${(n.nome || n.nome_adotante || '')} ${(n.mensagem) ? '- ' + n.mensagem : ''}</p>
      <p class="text-xs text-gray-400 mt-1">${new Date().toLocaleString()}</p>
    </div>
  `).join('')
}

// Expor utilitários UI globalmente para páginas administrativas
window.uiConfirm = function(message, callback) {
  try {
    if (typeof message !== 'string') message = String(message)
    createGlobalConfirmModal()

    const modal = document.getElementById('global-ui-confirm')
    const messageEl = modal.querySelector('#globalUiConfirmMessage')
    const confirmButton = modal.querySelector('[data-action="confirm"]')
    const cancelButton = modal.querySelector('[data-action="cancel"]')

    let cleanup = () => {
      modal.classList.add('hidden')
      modal.classList.remove('flex')
      confirmButton.replaceWith(confirmButton.cloneNode(true))
      cancelButton.replaceWith(cancelButton.cloneNode(true))
    }

    messageEl.textContent = message
    modal.classList.remove('hidden')
    modal.classList.add('flex')

    const handleConfirm = () => {
      cleanup()
      if (typeof callback === 'function') callback()
    }

    const handleCancel = () => {
      cleanup()
    }

    modal.querySelector('[data-action="confirm"]').addEventListener('click', handleConfirm)
    modal.querySelector('[data-action="cancel"]').addEventListener('click', handleCancel)
  } catch (e) {
    console.error('uiConfirm error', e)
  }
}

function createGlobalConfirmModal() {
  if (document.getElementById('global-ui-confirm')) return

  const modal = document.createElement('div')
  modal.id = 'global-ui-confirm'
  modal.className = 'fixed inset-0 z-[1200] hidden items-center justify-center bg-black/60 p-4'
  modal.innerHTML = `
    <div class="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
      <div class="p-6 border-b border-slate-200">
        <h2 class="text-xl font-semibold text-slate-900">Confirmação</h2>
        <p id="globalUiConfirmMessage" class="mt-2 text-sm text-slate-600"></p>
      </div>
      <div class="flex flex-col gap-4 p-6 sm:flex-row sm:justify-end sm:items-center">
        <button type="button" data-action="cancel" class="w-full sm:w-auto rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Cancelar</button>
        <button type="button" data-action="confirm" class="w-full sm:w-auto rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition">Confirmar</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)
}

window.uiShowError = function(message) {
  showToast(typeof message === 'string' ? message : JSON.stringify(message))
}

window.uiShowSuccess = function(message) {
  showToast(typeof message === 'string' ? message : JSON.stringify(message))
}

function setupToastContainer() {
  if (document.getElementById('notification-toast-container')) return

  const container = document.createElement('div')
  container.id = 'notification-toast-container'
  container.className = 'fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 pointer-events-none'
  document.body.appendChild(container)
}

async function loadSocketIoClient() {
  if (window.io) return
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Não foi possível carregar o cliente Socket.IO'))
    document.head.appendChild(script)
  })
}

function getSocketServerUrl() {
  if (window.location.protocol === 'file:') {
    return 'http://localhost:3001'
  }

  const origin = window.location.origin
  if (origin.includes(':3001')) {
    return origin
  }

  return 'http://localhost:3001'
}

function connectAdminSocket() {
  if (!window.io) return null
  const socketUrl = getSocketServerUrl()
  const socket = io(socketUrl, { transports: ['websocket'], reconnectionAttempts: 5 })

  socket.on('connect_error', (error) => {
    console.warn('Socket.IO connect_error', error)
  })

  socket.on('reconnect_attempt', () => {
    console.log('Tentando reconectar Socket.IO...')
  })

  return socket
}

function handleNovaSolicitacao(payload) {
  const badge = document.getElementById('badge-solicitacoes')
  const count = document.getElementById('notification-count')
  if (badge) badge.classList.remove('hidden')
  if (count) count.classList.remove('hidden')
  pushAdminNotification({
    titulo: 'Nova solicitação',
    nome: payload.nome || payload.nome_adotante || 'Usuário',
    mensagem: payload.mensagem || '',
    receivedAt: new Date().toISOString()
  })
  showToast(`Nova solicitação recebida de ${payload.nome || payload.nome_adotante || 'um usuário'}`)
}

function showToast(message) {
  const container = document.getElementById('notification-toast-container')
  if (!container) return

  const toast = document.createElement('div')
  toast.className = 'max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700 opacity-0 translate-y-6 pointer-events-auto'
  toast.style.transition = 'opacity 0.35s ease, transform 0.35s ease'
  toast.style.transform = 'translateY(20px)'

  toast.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 text-slate-950">
        <i class="fas fa-bell"></i>
      </div>
      <div class="flex-1">
        <p class="font-semibold">Nova solicitação</p>
        <p class="text-sm text-slate-100 leading-snug">${message}</p>
      </div>
    </div>
  `

  container.appendChild(toast)

  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateY(0)'
  })

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(20px)'
    toast.addEventListener('transitionend', () => toast.remove(), { once: true })
  }, 5000)
}