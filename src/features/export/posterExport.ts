async function waitForPosterAssets(element: HTMLElement) {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }
  const images = [...element.querySelectorAll('img')]
  await Promise.all(images.map(async (image) => {
    if (image.complete) {
      if (image.naturalWidth > 0) return
      throw new Error(`Poster image failed to load: ${image.src}`)
    }
    await new Promise<void>((resolve, reject) => {
      image.addEventListener('load', () => resolve(), { once: true })
      image.addEventListener('error', () => reject(new Error(`Poster image failed to load: ${image.src}`)), { once: true })
    })
  }))
}

/**
 * Draws one map SVG (paths, dots and text) onto a canvas in the live page, where the web
 * fonts are already loaded. html2canvas cannot draw inline SVG reliably, so the cloned
 * poster gets this canvas instead of the SVG.
 */
export function rasterizeMapSvg(svg: SVGSVGElement): HTMLCanvasElement {
  const viewBox = svg.viewBox.baseVal
  const width = viewBox.width || 1100
  const height = viewBox.height || 1100
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  for (const node of Array.from(svg.querySelectorAll<SVGElement>('path, circle, text'))) {
    const tag = node.tagName.toLowerCase()
    const fill = node.getAttribute('fill')
    const stroke = node.getAttribute('stroke')
    const strokeWidth = parseFloat(node.getAttribute('stroke-width') || '1')
    const alpha = (name: string) => {
      const value = parseFloat(node.getAttribute(name) || '1')
      return Number.isNaN(value) ? 1 : value
    }
    ctx.save()
    try {
      if (tag === 'text') {
        const style = window.getComputedStyle(node)
        const size = parseFloat(node.getAttribute('font-size') || '16')
        ctx.font = `${node.getAttribute('font-weight') || style.fontWeight} ${size}px ${style.fontFamily}`
        const anchor = node.getAttribute('text-anchor')
        ctx.textAlign = anchor === 'middle' ? 'center' : anchor === 'end' ? 'right' : 'left'
        const x = parseFloat(node.getAttribute('x') || '0')
        const y = parseFloat(node.getAttribute('y') || '0')
        const text = node.textContent ?? ''
        if (stroke && stroke !== 'none' && strokeWidth > 0) {
          ctx.lineJoin = 'round'
          ctx.lineWidth = strokeWidth
          ctx.strokeStyle = stroke
          ctx.strokeText(text, x, y)
        }
        if (fill && fill !== 'none') {
          ctx.fillStyle = fill
          ctx.fillText(text, x, y)
        }
        continue
      }
      const shape = tag === 'circle'
        ? (() => {
          const circle = new Path2D()
          circle.arc(parseFloat(node.getAttribute('cx') || '0'), parseFloat(node.getAttribute('cy') || '0'), parseFloat(node.getAttribute('r') || '0'), 0, Math.PI * 2)
          return circle
        })()
        : new Path2D(node.getAttribute('d') || '')
      if (fill && fill !== 'none') {
        ctx.globalAlpha = alpha('fill-opacity')
        ctx.fillStyle = fill
        ctx.fill(shape)
      }
      if (stroke && stroke !== 'none' && strokeWidth > 0) {
        ctx.globalAlpha = alpha('stroke-opacity')
        ctx.strokeStyle = stroke
        ctx.lineWidth = strokeWidth
        ctx.lineJoin = (node.getAttribute('stroke-linejoin') as CanvasLineJoin) || 'round'
        ctx.stroke(shape)
      }
    } catch (error) {
      console.warn('Could not draw a map element onto the poster canvas.', error)
    } finally {
      ctx.restore()
    }
  }
  return canvas
}

export async function renderPosterCanvas(element: HTMLElement) {
  const { default: html2canvas } = await import('html2canvas')
  await waitForPosterAssets(element)
  const mapCanvases = Array.from(element.querySelectorAll<SVGSVGElement>('svg')).map(rasterizeMapSvg)

  return html2canvas(element, {
    backgroundColor: null,
    width: 1200,
    height: 1600,
    scale: 1,
    useCORS: true,
    allowTaint: false,
    logging: false,
    windowWidth: 1200,
    windowHeight: 1600,
    onclone: (clonedDocument) => {
      const clonedHost = clonedDocument.querySelector<HTMLElement>('.poster-export-host')
      if (clonedHost) {
        clonedHost.style.position = 'static'
        clonedHost.style.top = '0'
        clonedHost.style.left = '0'
        clonedHost.style.width = '1200px'
        clonedHost.style.height = '1600px'
        clonedHost.style.overflow = 'visible'
        clonedHost.style.visibility = 'visible'
        clonedHost.style.opacity = '1'
      }

      const clonedStage = clonedDocument.querySelector<HTMLElement>('.poster-export-stage')
      if (clonedStage) {
        clonedStage.style.opacity = '1'
        clonedStage.style.visibility = 'visible'
        clonedStage.style.position = 'relative'
        clonedStage.style.width = '1200px'
        clonedStage.style.height = '1600px'

        Array.from(clonedStage.querySelectorAll('svg')).forEach((svg, index) => {
          const source = mapCanvases[index]
          if (!source) return
          const canvas = clonedDocument.createElement('canvas')
          canvas.width = source.width
          canvas.height = source.height
          canvas.className = svg.getAttribute('class') || ''
          canvas.style.width = '980px'
          canvas.style.height = '980px'
          canvas.style.maxWidth = '100%'
          canvas.style.maxHeight = '100%'
          canvas.style.display = 'block'
          canvas.getContext('2d')?.drawImage(source, 0, 0)
          svg.parentNode?.replaceChild(canvas, svg)
        })
      }
    },
  })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

export async function downloadPoster(element: HTMLElement) {
  const canvas = await renderPosterCanvas(element)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) resolve(value)
      else reject(new Error('Browser could not encode the poster as PNG.'))
    }, 'image/png')
  })
  downloadBlob(blob, 'explore-naogaon-map.png')
}
