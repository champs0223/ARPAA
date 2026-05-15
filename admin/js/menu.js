const paginaAtual = window.location.pathname.split("/").pop()
const links = document.querySelectorAll(".menu-link")

links.forEach(link => {
  if (link.getAttribute("href") === paginaAtual) {
    link.classList.add("text-yellow-300", "menu-ativo")
  }
})

function toggleMenu(){
  const submenu = document.getElementById("submenuAdocoes")
  const seta = document.getElementById("iconeSeta")

  submenu.classList.toggle("hidden")
  seta.classList.toggle("rotate-180")
}

if(paginaAtual === "adocoes.html" || paginaAtual === "adotantes.html" || paginaAtual === "solicitacoes.html"){
  document.getElementById("submenuAdocoes").classList.remove("hidden")
  document.getElementById("iconeSeta").classList.add("rotate-180")
}