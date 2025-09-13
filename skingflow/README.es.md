# SkinFlow Multi-Agent Framework

> 🚀 **Motor de flujo flexible para aplicaciones multi-agente inteligentes** - Soporta descomposición de tareas complejas, planificación inteligente, gestión de memoria e integración de herramientas

[![Licencia: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Versión Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Estado del Framework](https://img.shields.io/badge/status-production--ready-green.svg)]()
[![Documentación](https://img.shields.io/badge/docs-online-blue.svg)](https://skingflow-docs.pages.dev/)
[![Versión NPM](https://img.shields.io/npm/v/skingflow.svg)](https://www.npmjs.com/package/skingflow)

## 📖 Tabla de Contenidos

- [Inicio Rápido](#inicio-rápido)
- [Características Principales](#características-principales)
- [Visión General de la Arquitectura](#visión-general-de-la-arquitectura)
- [Documentación](#documentación)
- [Ejemplos](#ejemplos)
- [Soporte de Idiomas](#soporte-de-idiomas)

## 🚀 Inicio Rápido

### Experiencia Rápida de 5 Minutos

```bash
# 1. Clonar el repositorio
git clone https://github.com/skingko/skingflow.git
cd skingflow

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar el archivo .env para establecer tu clave API de LLM y conexión de base de datos

# 4. Ejecutar el ejemplo
node examples/quick-start/index.js
```

### Ejemplo de Uso Simple

```javascript
import { createMultiAgentFramework } from './lib/multi-agent/index.js';

// Crear instancia del framework
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'http',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: 'your-api-key',
    model: 'gpt-4'
  },
  memory: {
    storage: {
      type: 'postgres',
      config: {
        host: 'localhost',
        database: 'skingflow',
        user: 'postgres',
        password: 'your-password'
      }
    }
  }
});

// Procesar solicitud
const result = await framework.processRequest(
  "Crear una aplicación web simple",
  { userId: 'user123' }
);

console.log(result);
```

## ✨ Características Principales

### 🧠 Sistema Multi-Agente Inteligente
- **Agente de Planificación**: Descompone automáticamente tareas complejas y crea planes de ejecución
- **Sub-Agentes Profesionales**: Especializados en investigación, programación, análisis de datos, creación de contenido
- **Coordinación Inteligente**: Selecciona automáticamente los agentes más adecuados para tareas específicas
- **Aislamiento de Contexto**: Garantiza colaboración segura entre agentes

### 💾 Sistema de Memoria Avanzado (arquitectura basada en mem0)
- **Memoria a Corto Plazo**: Gestión de contexto de sesión e información temporal
- **Memoria a Largo Plazo**: Almacenamiento persistente de conocimiento e historial
- **Preferencias de Usuario**: Configuración personalizada y aprendizaje de hábitos
- **Búsqueda Semántica**: Recuperación inteligente de memoria basada en vectores

### 🛠️ Sistema de Herramientas Unificado
- **Definiciones de Herramientas YAML/XML**: Configuración declarativa de herramientas, fácil de extender
- **Sistema de Archivos Virtual**: Entorno seguro de operaciones de archivo
- **Soporte de Protocolo MCP**: Integración estandarizada de herramientas
- **Herramientas Personalizadas**: Mecanismo flexible de desarrollo e integración de herramientas

### 🔄 Motor de Procesamiento de Flujo
- **Procesamiento Asíncrono de Flujo**: Ejecución concurrente de alto rendimiento
- **Respuesta en Tiempo Real**: Soporta salida en streaming y retroalimentación en tiempo real
- **Orquestación de Flujo de Trabajo**: Gestión inteligente de flujos de trabajo complejos

### 🛡️ Confiabilidad Empresarial
- **Mecanismo de Degradación**: Estrategias de recuperación de errores multicapa
- **Disyuntor**: Aislamiento y recuperación automática de fallos
- **Monitoreo de Salud**: Seguimiento en tiempo real del estado del sistema
- **Registro Detallado**: Información completa de depuración y auditoría

## 🏗️ Visión General de la Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    SkinFlow Framework                        │
├─────────────────────────────────────────────────────────────┤
│  Sistema Multi-Agente                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Agente de   │  │ Gestor de   │  │ Sistema de   │         │
│  │ Planificación│ Sub-Agentes  │  │ Coordinación│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Servicios Centrales                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Abstracción │  │ Sistema de  │  │ Registro de │         │
│  │ LLM         │  │ Memoria     │  │ Herramientas│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Infraestructura                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Gestor de   │  │ Sistema de  │  │ Motor de    │         │
│  │ Respaldo    │  │ Archivos    │  │ Flujo       │         │
│  │             │  │ Virtual     │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 📚 Documentación

- **[Guía de Instalación](docs/installation.md)** - Pasos detallados de instalación y configuración
- **[Tutorial de Uso Básico](docs/basic-usage.md)** - Tutorial paso a paso de uso
- **[Configuración Avanzada](docs/advanced-config.md)** - Características avanzadas y configuración personalizada
- **[Sistema de Herramientas](docs/tools.md)** - Guía de desarrollo e integración de herramientas
- **[Sistema de Memoria](docs/memory.md)** - Explicación detallada de gestión de memoria
- **[Sistema de Agentes](docs/agents.md)** - Mecanismo de colaboración multi-agente
- **[Referencia API](docs/api-reference.md)** - Documentación API completa
- **[Mejores Prácticas](docs/best-practices.md)** - Recomendaciones para entorno de producción
- **[Solución de Problemas](docs/troubleshooting.md)** - Soluciones a problemas comunes

## 🎯 Ejemplos

- **[Inicio Rápido](examples/quick-start/)** - Ejemplo de uso más simple
- **[Asistente Inteligente](examples/intelligent-assistant/)** - Aplicación completa de asistente inteligente
- **[Creación de Contenido](examples/content-creation/)** - Generación automatizada de contenido
- **[Análisis de Datos](examples/data-analysis/)** - Procesamiento inteligente de datos
- **[Generador de Aplicaciones Web](examples/web-app-generator/)** - Desarrollo web automatizado

## 🌐 Soporte de Idiomas

Este proyecto soporta múltiples idiomas:

- 🇺🇸 **English** - [README.md](README.md)
- 🇨🇳 **中文** - [README.zh.md](README.zh.md)
- 🇪🇸 **Español** - [README.es.md](README.es.md)
- 🇫🇷 **Français** - [README.fr.md](README.fr.md)
- 🇩🇪 **Deutsch** - [README.de.md](README.de.md)

📖 **Documentación Online**: [skingflow-docs.pages.dev](https://skingflow-docs.pages.dev/)

## 🚀 Listo para Producción

El framework SkinFlow está completamente probado con las siguientes características de producción:

- ✅ **Alta Disponibilidad**: Manejo completo de errores y mecanismos de degradación
- ✅ **Alto Rendimiento**: Procesamiento asíncrono de flujo y caché inteligente
- ✅ **Escalable**: Arquitectura modular, fácil de extender
- ✅ **Monitoreable**: Registros detallados y estadísticas
- ✅ **Seguridad**: Sistema de archivos virtual y control de permisos

## 📊 Puntos de Referencia

| Métrica | Rendimiento |
|---------|-------------|
| Tiempo de respuesta de solicitud simple | < 2 segundos |
| Tiempo de procesamiento de tarea compleja | < 30 segundos |
| Capacidad de procesamiento concurrente | 100+ solicitudes/minuto |
| Uso de memoria | < 512MB |
| Tasa de éxito | > 95% |

## 🤝 Contribuyendo

¡Bienvenimos las contribuciones de la comunidad! Por favor consulta la [Guía de Contribución](CONTRIBUTING.md) para aprender cómo participar en el desarrollo del proyecto.

## 📞 Soporte

- **Documentación**: [Documentación Completa](docs/)
- **Ejemplos**: [Código de Ejemplo](examples/)
- **Retroalimentación de Problemas**: [GitHub Issues](https://github.com/skingko/skingflow/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/skingko/skingflow/discussions)

## 📄 Licencia

Este proyecto es código abierto bajo la Licencia MIT. Ver archivo [LICENSE](LICENSE) para detalles.

---

**🎉 ¡Comienza a usar SkinFlow para construir tus aplicaciones inteligentes!**