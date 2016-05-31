import windowSize from './windowSize'

/*****
 * Basic Tooltip
 *****/

const REMOVE_DELAY = 500 // ms to wait before removing a tooltip

let tooltip = {}

function calcPos (pos, container, gravity = 's', dist = 10) {
  const scrollTop  = window.scrollY
  const scrollLeft = window.scrollX
  const width      = parseInt(container.offsetWidth)
  const height     = parseInt(container.offsetHeight)

  let wSize = windowSize()
  let t = {}
  let tLeft
  let tTop

  // Recursively calculate top offset of an element from the body
  function offsetTop (elem) {
    let top = 0

    do {
      if (!isNaN(elem.offsetTop)) top += elem.offsetTop
    } while (elem = elem.offsetParent)

    return top
  }

  // Recursively calculate left offset of an element from the body
  function offsetLeft (elem) {
    let left = 0

    do {
      if (!isNaN(elem.offsetLeft)) left += elem.offsetLeft
    } while (elem = elem.offsetParent )

    return left
  }

  // Account for scroll bars
  // **do this only when scrollbars take up space**
  if (window.innerHeight < document.body.scrollHeight)
    wSize.width -= 16
  if (window.innerWidth < document.body.scrollWidth)
    wSize.height -= 16

  switch (gravity) {
    case 'e':
      t.left   = pos[0] - width - dist
      t.top    = pos[1] - (height / 2)
      tLeft    = t.left + offsetLeft(container)
      tTop     = t.top + offsetTop(container)
      if (tLeft < scrollLeft) // check if left edge is off screen
        t.left = pos[0] > scrollLeft - dist  //TODO: check math here, also flip gravity, consider checking if right is larger than left
                 ? pos[0] + dist
                 : scrollLeft - tLeft + t.left
      if (tTop < scrollTop) // check if top edge is off screen
        t.top  = scrollTop - tTop + t.top
      if (height > scrollTop + wSize.height - tTop) // check if bottom edge is off screen
        t.top  = scrollTop + wSize.height - tTop + t.top - height
      break

    case 'w':
      t.left   = pos[0] + dist
      t.top    = pos[1] - (height / 2)
      tLeft    = t.left + offsetLeft(container)
      tTop     = t.top + offsetTop(container)
      if (width > wSize.width + scrollLeft - tLeft) // check if right edge is off screen
        t.left = pos[0] - width - dist //TODO: flip gravity, consider checking if left is larger than right
      if (tTop < scrollTop) // check if top edge is off screen
        t.top  = scrollTop + 5
      if (height > scrollTop + wSize.height - tTop) // check if bottom edge is off screen
        t.top  = scrollTop - height - 5 //TODO: flip gravity
      break

    case 'n':
      t.left   = pos[0] - (width / 2)
      t.top    = pos[1] + dist
      tLeft    = t.left + offsetLeft(container)
      tTop     = t.top + offsetTop(container)
      if (tLeft < scrollLeft) //check if left edge is off screen
        t.left = scrollLeft - tLeft + t.left
      if (width > wSize.width - tLeft) //check if right edge is off screen
        t.left = t.left + wSize.width - tLeft - width
      if (height > scrollTop + wSize.height - tTop) { //check is bottom edge goes off screen
        if (scrollTop - tTop < scrollTop + wSize.height - tTop - height) { //check if bottom edge is off screen
          return calcPos(pos, container, 's', dist)
        } else {
          t.top  = scrollTop + wSize.height - tTop + t.top - height
        }
      }
      break

    default: //case 's':
      t.left   = pos[0] - (width / 2)
      t.top    = pos[1] - height - dist
      tLeft  = t.left + offsetLeft(container)
      tTop   = t.top + offsetTop(container)
      if (tLeft < scrollLeft) //check if left edge is off screen
        t.left = scrollLeft - tLeft + t.left
      if (width > wSize.width - tLeft) //check if right edge is off screen
        t.left = t.left + wSize.width - tLeft - width
      if (scrollTop > tTop) { //check if top edge is off screen
        if (scrollTop - tTop < scrollTop + wSize.height - tTop - height) { //check if bottom has more room than top
          return calcPos(pos, container, 'n', dist)
        } else {
          t.top  = scrollTop
        }
      }
      break
  }

  t.gravity = gravity // incase the gravity was inverted above return new gravity
  return t
}

tooltip.show = function ({pos, content, gravity = 's', dist = 10, parent, classes}) {
  let container = document.createElement('div')
  let body      = parent

  // If the parent element is an SVG element, place tooltip in the <body> element.
  if ( !parent || parent.tagName.match(/g|svg/i)) {
    body   = document.getElementsByTagName('body')[0]
    parent = false
  }

  container.innerHTML     = content
  container.style.left    = 0
  container.style.top     = 0
  container.style.opacity = 0
  container.className     = 'd3-tooltip ' +
                            (classes ? classes : 'd3-xy-tooltip') +
                            ' d3-tooltip-gravity-' + gravity

  body.appendChild(container)

  // These can't be calculated until the container is appended
  let { left, top } = calcPos(pos, container, gravity, dist)

  //TODO: decide if I need to set className twice
  container.className = 'd3-tooltip ' +
                        (classes ? classes : 'd3-xy-tooltip') +
                        ' d3-tooltip-gravity-' + gravity
  container.style.left          = left + 'px'
  container.style.top           = top + 'px'
  container.style.opacity       = 1
  container.style.position      = 'absolute'
  container.style.pointerEvents = 'none'

  return container
}

tooltip.cleanup = function(delay = REMOVE_DELAY) {
  let tooltips = document.getElementsByClassName('d3-tooltip')
  let purging  = []
  let removeMe

  for (let i = 0; i < tooltips.length; i++) {
    purging.push(tooltips[i])
    tooltips[i].style.transitionDelay = '0 !important'
    tooltips[i].style.opacity = 0
    // Mark tooltips for removal by this class (so others cleanups won't find it)
    tooltips[i].className = 'd3-tooltip d3-tooltip-pending-removal'
  }

  setTimeout(function() {
    while (removeMe = purging.pop()) {
      removeMe.parentNode.removeChild(removeMe)
    }
  }, delay)
}

export default tooltip
