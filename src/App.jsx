import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

/* ===========================
   INTERSECTION OBSERVER HOOK
   =========================== */
function useInView(options = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.1, ...options })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return [ref, isVisible]
}

/* ===========================
   ANIMATED COUNTER HOOK
   =========================== */
function useCounter(end, duration = 2000, startCounting = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!startCounting) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [startCounting, end, duration])

  return count
}

/* ===========================
   PARTICLE BACKGROUND
   =========================== */
function ParticleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []
    let mouse = { x: null, y: null }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('mousemove', handleMouse)

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.8
        this.speedY = (Math.random() - 0.5) * 0.8
        this.color = ['#00d4ff', '#8b5cf6', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)]
        this.opacity = Math.random() * 0.5 + 0.2
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height

        // Mouse repulsion
        if (mouse.x !== null) {
          const dx = this.x - mouse.x
          const dy = this.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            this.x += dx / dist * 2
            this.y += dy / dist * 2
          }
        }
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    for (let i = 0; i < 80; i++) {
      particles.push(new Particle())
    }

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.strokeStyle = particles[i].color
            ctx.globalAlpha = 0.08 * (1 - dist / 150)
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(); p.draw() })
      connectParticles()
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-canvas" />
}

/* ===========================
   FLOATING TECH ICONS
   =========================== */
function FloatingIcons() {
  const icons = [
    { emoji: '⚛️', x: '10%', y: '20%', delay: 0, size: 2 },
    { emoji: '🟢', x: '85%', y: '15%', delay: 1, size: 1.5 },
    { emoji: '🍃', x: '75%', y: '70%', delay: 2, size: 1.8 },
    { emoji: '📦', x: '15%', y: '75%', delay: 3, size: 1.6 },
    { emoji: '🔷', x: '90%', y: '45%', delay: 1.5, size: 1.4 },
    { emoji: '💻', x: '5%', y: '50%', delay: 2.5, size: 1.7 },
    { emoji: '🗄️', x: '50%', y: '85%', delay: 0.5, size: 1.5 },
    { emoji: '⚡', x: '40%', y: '10%', delay: 3.5, size: 1.3 },
  ]

  return (
    <div className="floating-icons-container">
      {icons.map((icon, i) => (
        <span
          key={i}
          className="floating-icon"
          style={{
            left: icon.x,
            top: icon.y,
            animationDelay: `${icon.delay}s`,
            fontSize: `${icon.size}rem`,
          }}
        >
          {icon.emoji}
        </span>
      ))}
    </div>
  )
}

/* ===========================
   MAGNETIC BUTTON
   =========================== */
function MagneticButton({ children, href, className }) {
  const btnRef = useRef(null)

  const handleMouseMove = (e) => {
    const btn = btnRef.current
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`
  }

  const handleMouseLeave = () => {
    btnRef.current.style.transform = 'translate(0, 0)'
  }

  return (
    <a
      ref={btnRef}
      href={href}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.2s ease-out' }}
    >
      {children}
    </a>
  )
}

/* ===========================
   TILT CARD
   =========================== */
function TiltCard({ children, className, style }) {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotateX = (y - 0.5) * -10
    const rotateY = (x - 0.5) * 10
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    // Dynamic shine effect
    card.querySelector('.tilt-shine').style.background =
      `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.1) 0%, transparent 60%)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
    card.querySelector('.tilt-shine').style.background = 'transparent'
  }

  return (
    <div
      ref={cardRef}
      className={className}
      style={{ ...style, transition: 'transform 0.3s ease-out' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="tilt-shine" />
      {children}
    </div>
  )
}

/* ===========================
   STAGGER CHILDREN
   =========================== */
function StaggerChildren({ children, isVisible, baseDelay = 0 }) {
  return children.map((child, i) => (
    <div
      key={i}
      className={`stagger-item ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${baseDelay + i * 0.12}s` }}
    >
      {child}
    </div>
  ))
}

/* ===========================
   NAVBAR
   =========================== */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)
      const sections = ['home', 'about', 'skills', 'experience', 'projects', 'education', 'contact']
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveSection(id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = () => setMenuOpen(false)

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <a href="#home" className="nav-logo">
          {'<'}Saran<span>/</span>{'>'}
        </a>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {['Home', 'About', 'Skills', 'Experience', 'Projects', 'Education'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className={activeSection === item.toLowerCase() ? 'active' : ''}
              onClick={handleClick}
            >
              {item}
            </a>
          ))}
          <a href="#contact" className="nav-contact-btn" onClick={handleClick}>
            Contact
          </a>
        </div>
        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}

/* ===========================
   HERO SECTION
   =========================== */
function Hero() {
  const [typedText, setTypedText] = useState('')
  const fullText = 'Full Stack Developer'
  const [ref, isVisible] = useInView()

  const projects = useCounter(1, 1500, isVisible)
  const skills = useCounter(8, 1500, isVisible)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1))
      i++
      if (i >= fullText.length) clearInterval(interval)
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="hero" id="home" ref={ref}>
      <ParticleField />
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>
        <div className="hero-grid"></div>
      </div>
      <FloatingIcons />
      <div className="container">
        <div className="hero-content">
          <div className={`hero-badge ${isVisible ? 'animate-pop' : ''}`}>
            <span className="dot"></span>
            Open to opportunities
          </div>
          <p className="hero-greeting">Hello, I'm</p>
          <h1 className="hero-name">
            <span className="gradient-text">Saran</span>
            <br />
            Muthukumar K
          </h1>
          <p className="hero-title">
            {'< '}<span className="typed-text">{typedText}</span>{' />'}
          </p>
          <p className="hero-description">
            Aspiring MERN Stack Developer with expertise in building full-stack applications,
            REST APIs, and responsive user interfaces. Passionate about creating scalable,
            user-friendly web solutions.
          </p>
          <div className="hero-buttons">
            <MagneticButton href="#projects" className="btn-primary">
              <span className="btn-icon">🚀</span> View My Work
            </MagneticButton>
            <MagneticButton href="#contact" className="btn-secondary">
              <span className="btn-icon">💬</span> Let's Connect
            </MagneticButton>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">{projects}+</div>
              <div className="stat-label">Projects</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{skills}+</div>
              <div className="stat-label">Tech Skills</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2026</div>
              <div className="stat-label">Graduating</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <div className="hero-image-glow"></div>
            <img src="/images/profile.png" alt="Saran Muthukumar K" className="hero-profile-img" />
            <div className="hero-image-ring"></div>
            <div className="hero-image-ring ring-2"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===========================
   ABOUT SECTION
   =========================== */
function About() {
  const [ref, isVisible] = useInView()

  return (
    <section className="about" id="about">
      <div className="container">
        <span className="section-label">About Me</span>
        <h2 className="section-title">Turning Ideas Into Digital Reality</h2>
        <div ref={ref} className={`about-grid fade-in-up ${isVisible ? 'visible' : ''}`}>
          <div className="about-image-wrapper">
            <TiltCard className="about-image-card">
              <img src="/images/profile.png" alt="Saran" className="about-profile-img" />
            </TiltCard>
            <div className="about-stat-badges">
              <div className="about-badge">
                <span className="about-badge-icon">💼</span>
                <span className="about-badge-text">1+ Year Exp</span>
              </div>
              <div className="about-badge">
                <span className="about-badge-icon">⚡</span>
                <span className="about-badge-text">MERN Stack</span>
              </div>
              <div className="about-badge">
                <span className="about-badge-icon">🤖</span>
                <span className="about-badge-text">AI / ML</span>
              </div>
            </div>
          </div>
          <div className="about-text">
            <h3>A passionate developer crafting the web</h3>
            <p>
              I'm a B.Tech IT student at J K K Nataraja College of Engineering and Technology,
              currently working as a Full Stack Engineer Intern at Cyberdude Networks. I specialize
              in the MERN Stack — MongoDB, Express.js, React.js, and Node.js.
            </p>
            <p>
              I love building things that live on the internet. My focus is on creating clean,
              performant, and user-friendly applications with modern technologies and best practices.
              I'm also exploring AI and Machine Learning to build smarter applications.
            </p>
            <div className="about-highlights">
              <StaggerChildren isVisible={isVisible} baseDelay={0.3}>
                {[
                  { icon: '🚀', text: 'Full Stack Development' },
                  { icon: '⚡', text: 'REST API Design' },
                  { icon: '🎨', text: 'Responsive UI/UX' },
                  { icon: '🤖', text: 'AI & Machine Learning' },
                ].map((h, i) => (
                  <div className="highlight-item" key={i}>
                    <span className="highlight-icon">{h.icon}</span>
                    <span className="highlight-text">{h.text}</span>
                  </div>
                ))}
              </StaggerChildren>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===========================
   SKILLS SECTION
   =========================== */
function Skills() {
  const [ref, isVisible] = useInView()

  const categories = [
    {
      icon: '🎨',
      title: 'Frontend',
      desc: 'Building pixel-perfect, responsive interfaces',
      color: '#00d4ff',
      skills: ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'React Hooks'],
    },
    {
      icon: '⚙️',
      title: 'Backend',
      desc: 'Crafting robust server-side applications',
      color: '#8b5cf6',
      skills: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Authentication', 'Database Design'],
    },
    {
      icon: '🤖',
      title: 'AI & ML',
      desc: 'Building intelligent, data-driven applications',
      color: '#10b981',
      skills: ['Python', 'TensorFlow', 'Machine Learning', 'NLP', 'Data Analysis', 'Neural Networks'],
    },
    {
      icon: '🛠️',
      title: 'Tools & More',
      desc: 'Productivity tools and best practices',
      color: '#ec4899',
      skills: ['Git', 'GitHub', 'VS Code', 'Responsive Design', 'Debugging', 'Team Collaboration'],
    },
  ]

  return (
    <section className="skills" id="skills">
      <div className="container">
        <span className="section-label">Skills</span>
        <h2 className="section-title">Technologies I Work With</h2>
        <p className="section-desc">
          Here's my toolkit for building modern, scalable web applications from front to back.
        </p>
        <div ref={ref} className="skills-grid">
          {categories.map((cat, i) => (
            <TiltCard
              className={`skill-category stagger-item ${isVisible ? 'visible' : ''}`}
              key={i}
              style={{ transitionDelay: `${i * 0.2}s`, '--accent': cat.color }}
            >
              <div className="skill-category-icon" style={{ boxShadow: `0 0 20px ${cat.color}33` }}>
                {cat.icon}
              </div>
              <h3 className="skill-category-title">{cat.title}</h3>
              <p className="skill-category-desc">{cat.desc}</p>
              <div className="skill-tags">
                {cat.skills.map((skill, j) => (
                  <span
                    className={`skill-tag ${isVisible ? 'skill-tag-visible' : ''}`}
                    key={skill}
                    style={{ animationDelay: `${i * 0.2 + j * 0.06}s` }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===========================
   EXPERIENCE SECTION
   =========================== */
function Experience() {
  const [ref, isVisible] = useInView()

  return (
    <section className="experience" id="experience">
      <div className="container">
        <span className="section-label">Experience</span>
        <h2 className="section-title">Where I've Worked</h2>
        <div ref={ref} className={`experience-timeline fade-in-up ${isVisible ? 'visible' : ''}`}>
          <div className="timeline-item">
            <div className="timeline-dot active"></div>
            <TiltCard className="timeline-card">
              <div className="timeline-header">
                <div>
                  <div className="timeline-role">Full Stack Engineer Intern</div>
                  <div className="timeline-company">
                    <span className="company-icon">🏢</span> Cyberdude Networks
                  </div>
                </div>
                <span className="timeline-date">
                  <span className="pulse-dot"></span> Present
                </span>
              </div>
              <ul className="timeline-points">
                {[
                  'Working on real-world full-stack web development projects using MERN Stack',
                  'Developing and integrating frontend components with backend APIs',
                  'Collaborating with mentors and teams using Git/GitHub for version control',
                  'Gaining hands-on exposure to industry best practices and clean code standards',
                ].map((point, i) => (
                  <li
                    key={i}
                    className={`timeline-point-item ${isVisible ? 'visible' : ''}`}
                    style={{ transitionDelay: `${0.3 + i * 0.15}s` }}
                  >
                    {point}
                  </li>
                ))}
              </ul>
              <div className="timeline-techs">
                {['React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git'].map((t, i) => (
                  <span
                    className={`timeline-tech ${isVisible ? 'tech-visible' : ''}`}
                    key={t}
                    style={{ animationDelay: `${0.8 + i * 0.08}s` }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===========================
   PROJECTS SECTION
   =========================== */
function Projects() {
  const [ref, isVisible] = useInView()

  return (
    <section className="projects" id="projects">
      <div className="container">
        <span className="section-label">Projects</span>
        <h2 className="section-title">Things I've Built</h2>
        <p className="section-desc">
          Showcasing the projects I've worked on, combining modern technologies with clean design.
        </p>
        <div ref={ref} className={`projects-grid fade-in-up ${isVisible ? 'visible' : ''}`}>
          <TiltCard className="project-card">
            <div className="project-image-wrapper">
              <img src="/images/project-alumni.png" alt="Alumni Platform" className="project-image" />
              <div className="project-image-overlay"></div>
            </div>
            <div className="project-content">
              <span className="project-label">⭐ Featured · Team Project</span>
              <h3 className="project-title">
                Digital Platform for Centralized Alumni Data Management and Engagement
              </h3>
              <p className="project-description">
                A full-stack MERN application designed to centrally manage alumni records and
                engagement activities. Features secure authentication, role-based access for
                admins and alumni, interactive dashboards, and RESTful APIs for efficient
                data management.
              </p>
              <div className="project-features">
                <h4>Key Features</h4>
                <ul className="feature-list">
                  {[
                    'Secure user authentication & role-based access',
                    'Responsive interactive dashboards',
                    'RESTful API architecture',
                    'MongoDB for efficient data storage',
                    'Alumni records management',
                    'Engagement activity tracking',
                  ].map((f, i) => (
                    <li
                      key={i}
                      className={`feature-item ${isVisible ? 'visible' : ''}`}
                      style={{ transitionDelay: `${0.4 + i * 0.1}s` }}
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="project-tech-stack">
                {['MongoDB', 'Express.js', 'React.js', 'Node.js', 'JavaScript', 'Tailwind CSS', 'REST APIs', 'Git'].map(
                  (tech) => (
                    <span className="project-tech" key={tech}>{tech}</span>
                  )
                )}
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  )
}

/* ===========================
   EDUCATION SECTION
   =========================== */
function Education() {
  const [ref, isVisible] = useInView()

  return (
    <section className="education" id="education">
      <div className="container">
        <span className="section-label">Education</span>
        <h2 className="section-title">Academic Background</h2>
        <div ref={ref}>
          <TiltCard className={`education-card fade-in-up ${isVisible ? 'visible' : ''}`}>
            <div className="edu-icon">🎓</div>
            <div className="edu-info">
              <h3>B.Tech — Information Technology</h3>
              <p className="edu-college">J K K Nataraja College of Engineering and Technology</p>
              <p className="edu-year">2022 — 2026</p>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  )
}

/* ===========================
   CONTACT SECTION
   =========================== */
function Contact() {
  const [ref, isVisible] = useInView()
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [focusedField, setFocusedField] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const mailtoLink = `mailto:saranmuthukumar.k@gmail.com?subject=${encodeURIComponent(
      formData.subject
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    )}`
    window.open(mailtoLink)
  }

  const contactItems = [
    { icon: '📧', label: 'Email', value: 'saranmuthukumar.k@gmail.com', href: 'mailto:saranmuthukumar.k@gmail.com' },
    { icon: '📱', label: 'Phone', value: '+91 6379745451', href: 'tel:+916379745451' },
    { icon: '💼', label: 'LinkedIn', value: 'saran-muthukumar-k', href: 'https://linkedin.com/in/saran-muthukumar-k' },
    { icon: '🐙', label: 'GitHub', value: 'saranmuthukumark-cpu', href: 'https://github.com/saranmuthukumark-cpu' },
  ]

  return (
    <section className="contact" id="contact">
      <div className="container">
        <span className="section-label">Contact</span>
        <h2 className="section-title">Let's Work Together</h2>
        <p className="section-desc">
          Have a project in mind or just want to say hi? I'd love to hear from you.
        </p>
        <div ref={ref} className={`contact-grid fade-in-up ${isVisible ? 'visible' : ''}`}>
          <div className="contact-info">
            <h3>Get In Touch</h3>
            <p>
              I'm currently looking for new opportunities. Whether you have a question,
              a project idea, or just want to connect — feel free to reach out!
            </p>
            <div className="contact-links">
              <StaggerChildren isVisible={isVisible} baseDelay={0.2}>
                {contactItems.map((item, i) => (
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="contact-link-item"
                    key={i}
                  >
                    <div className="contact-link-icon">{item.icon}</div>
                    <div className="contact-link-text">
                      <span className="contact-link-label">{item.label}</span>
                      <span className="contact-link-value">{item.value}</span>
                    </div>
                    <span className="contact-arrow">→</span>
                  </a>
                ))}
              </StaggerChildren>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className={`form-group ${focusedField === 'name' ? 'focused' : ''}`}>
                <label htmlFor="name">Name</label>
                <input
                  type="text" id="name" name="name" placeholder="Your Name"
                  value={formData.name} onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
              <div className={`form-group ${focusedField === 'email' ? 'focused' : ''}`}>
                <label htmlFor="email">Email</label>
                <input
                  type="email" id="email" name="email" placeholder="your@email.com"
                  value={formData.email} onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>
            <div className={`form-group ${focusedField === 'subject' ? 'focused' : ''}`}>
              <label htmlFor="subject">Subject</label>
              <input
                type="text" id="subject" name="subject" placeholder="What's this about?"
                value={formData.subject} onChange={handleChange}
                onFocus={() => setFocusedField('subject')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>
            <div className={`form-group ${focusedField === 'message' ? 'focused' : ''}`}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message" name="message" placeholder="Tell me about your project..."
                value={formData.message} onChange={handleChange}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-btn">
              <span>Send Message</span>
              <span className="btn-arrow">✉️</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

/* ===========================
   FOOTER
   =========================== */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <a href="#home" className="footer-logo">
            {'<'}Saran<span>/</span>{'>'}
          </a>
          <div className="footer-socials">
            {[
              { icon: '🐙', href: 'https://github.com/saranmuthukumark-cpu', label: 'GitHub' },
              { icon: '💼', href: 'https://linkedin.com/in/saran-muthukumar-k', label: 'LinkedIn' },
              { icon: '📧', href: 'mailto:saranmuthukumar.k@gmail.com', label: 'Email' },
            ].map((s, i) => (
              <a
                key={i}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="footer-social-link"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
          <p className="footer-text">
            Designed & Built with <span className="heart">♥</span> by Saran Muthukumar K
          </p>
          <p className="footer-text">© 2026 All Rights Reserved</p>
        </div>
      </div>
    </footer>
  )
}

/* ===========================
   SCROLL TO TOP
   =========================== */
function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', toggle)
    return () => window.removeEventListener('scroll', toggle)
  }, [])

  return (
    <button
      className={`scroll-top ${visible ? 'visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
    >
      ↑
    </button>
  )
}

/* ===========================
   MAIN APP
   =========================== */
function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Education />
      <Contact />
      <Footer />
      <ScrollToTop />
    </>
  )
}

export default App
