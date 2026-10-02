export function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

export function getCookie(name) {
  const target = `${encodeURIComponent(name)}=`
  const cookies = document.cookie.split(';')
  for (let c of cookies) {
    c = c.trim()
    if (c.indexOf(target) === 0) {
      return decodeURIComponent(c.substring(target.length))
    }
  }
  return null
}

export function removeCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
}
