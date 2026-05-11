import { useEffect, useState } from 'react'

export function useActiveScene(sceneCount: number) {
  const [activeScene, setActiveScene] = useState(1)
  const [visibleScenes, setVisibleScenes] = useState(() => new Set<number>([1]))

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-landing-scene]'))
    if (sections.length === 0) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const scene = Number(entry.target.getAttribute('data-landing-scene'))
        if (!scene || !entry.isIntersecting) return
        setActiveScene(scene)
        setVisibleScenes((prev) => new Set(prev).add(scene))
      })
    }, { threshold: 0.4 })

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [sceneCount])

  return { activeScene, visibleScenes }
}
