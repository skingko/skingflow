# SkinFlow Multi-Agent Framework

> 🚀 **Flexibler Flow-Motor für intelligente Multi-Agent-Anwendungen** - Unterstützt komplexe Aufgabenzerlegung, intelligente Planung, Speicherverwaltung und Tool-Integration

[![Lizenz: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Framework-Status](https://img.shields.io/badge/status-production--ready-green.svg)]()
[![Dokumentation](https://img.shields.io/badge/docs-online-blue.svg)](https://skingflow-docs.pages.dev/)
[![NPM Version](https://img.shields.io/npm/v/skingflow.svg)](https://www.npmjs.com/package/skingflow)

## 📖 Inhaltsverzeichnis

- [Schnellstart](#schnellstart)
- [Kernfunktionen](#kernfunktionen)
- [Architektur-Überblick](#architektur-überblick)
- [Dokumentation](#dokumentation)
- [Beispiele](#beispiele)
- [Sprachunterstützung](#sprachunterstützung)

## 🚀 Schnellstart

### 5-Minuten-Schnellerfahrung

```bash
# 1. Repository klonen
git clone https://github.com/skingko/skingflow.git
cd skingflow

# 2. Abhängigkeiten installieren
npm install

# 3. Umgebungsvariablen konfigurieren
cp .env.example .env
# .env-Datei bearbeiten, um Ihren LLM-API-Schlüssel und Datenbankverbindung festzulegen

# 4. Beispiel ausführen
node examples/quick-start/index.js
```

### Einfaches Nutzungsbeispiel

```javascript
import { createMultiAgentFramework } from './lib/multi-agent/index.js';

// Framework-Instanz erstellen
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

// Anfrage verarbeiten
const result = await framework.processRequest(
  "Erstellen Sie eine einfache Webanwendung",
  { userId: 'user123' }
);

console.log(result);
```

## ✨ Kernfunktionen

### 🧠 Intelligentes Multi-Agent-System
- **Planungs-Agent**: Zerlegt automatisch komplexe Aufgaben und erstellt Ausführungspläne
- **Professionelle Sub-Agenten**: Spezialisiert auf Forschung, Programmierung, Datenanalyse, Inhaltserstellung
- **Intelligente Koordination**: Wählt automatisch am besten geeignete Agenten für spezifische Aufgaben aus
- **Kontext-Isolation**: Gewährleistet sichere Zusammenarbeit zwischen Agenten

### 💾 Erweitertes Speichersystem (mem0-basierte Architektur)
- **Kurzzeitspeicher**: Sitzungskontext und temporäre Informationsverwaltung
- **Langzeitspeicher**: Persistente Wissensspeicherung und Historie
- **Benutzervorlieben**: Personalisierte Einstellungen und Gewohnheitenlernen
- **Semantische Suche**: Vektorbasierte intelligente Speicherabfrage

### 🛠️ Einheitliches Tool-System
- **YAML/XML-Tool-Definitionen**: Deklarative Tool-Konfiguration, einfach zu erweitern
- **Virtuelles Dateisystem**: Sichere Dateioperationsumgebung
- **MCP-Protokoll-Unterstützung**: Standardisierte Tool-Integration
- **Benutzerdefinierte Tools**: Flexibler Tool-Entwicklungs- und Integrationsmechanismus

### 🔄 Stream-Verarbeitungs-Engine
- **Asynchrone Stream-Verarbeitung**: Hochleistungs-Nebenläufigkeitsausführung
- **Echtzeit-Antwort**: Unterstützt Streaming-Ausgabe und Echtzeit-Feedback
- **Workflow-Orchestrierung**: Intelligente Verwaltung komplexer Workflows

### 🛡️ Unternehmenszuverlässigkeit
- **Degradierungsmechanismus**: Mehrschichtige Fehlerwiederherstellungsstrategien
- **Circuit Breaker**: Automatische Fehlerisolierung und -wiederherstellung
- **Gesundheitsüberwachung**: Echtzeit-Systemstatus-Tracking
- **Detaillierte Protokollierung**: Vollständige Debugging- und Audit-Informationen

## 🏗️ Architektur-Überblick

```
┌─────────────────────────────────────────────────────────────┐
│                    SkinFlow Framework                        │
├─────────────────────────────────────────────────────────────┤
│  Multi-Agent-System                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Planungs-   │  │ Sub-Agenten │  │ Koordina-   │         │
│  │ Agent       │  │ Manager     │  │ tions-System│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Kerndienste                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ LLM         │  │ Speicher-   │  │ Tool-       │         │
│  │ Abstraktion │  │ System      │  │ Registry    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Infrastruktur                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Fallback-   │  │ Virtuelles   │  │ Stream-     │         │
│  │ Manager     │  │ Dateisystem │  │ Engine      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 📚 Dokumentation

- **[Installationshandbuch](docs/installation.md)** - Detaillierte Installations- und Konfigurationsschritte
- **[Grundlagen-Nutzungstutorial](docs/basic-usage.md)** - Schritt-für-Schritt-Nutzungstutorial
- **[Erweiterte Konfiguration](docs/advanced-config.md)** - Erweiterte Funktionen und benutzerdefinierte Konfiguration
- **[Tool-System](docs/tools.md)** - Tool-Entwicklungs- und Integrationshandbuch
- **[Speichersystem](docs/memory.md)** - Detaillierte Speicherverwaltungserklärung
- **[Agenten-System](docs/agents.md)** - Multi-Agent-Kollaborationsmechanismus
- **API-Referenz](docs/api-reference.md)** - Vollständige API-Dokumentation
- **[Best Practices](docs/best-practices.md)** - Produktionsumgebungsempfehlungen
- **[Fehlerbehebung](docs/troubleshooting.md)** - Lösungen für häufige Probleme

## 🎯 Beispiele

- **[Schnellstart](examples/quick-start/)** - Einfachstes Nutzungsbeispiel
- **[Intelligenter Assistent](examples/intelligent-assistant/)** - Vollständige intelligente Assistentenanwendung
- **[Inhaltserstellung](examples/content-creation/)** - Automatisierte Inhaltsgenerierung
- **[Datenanalyse](examples/data-analysis/)** - Intelligente Datenverarbeitung
- **[Web-Anwendungsgenerator](examples/web-app-generator/)** - Automatisierte Web-Entwicklung

## 🌐 Sprachunterstützung

Dieses Projekt unterstützt mehrere Sprachen:

- 🇺🇸 **English** - [README.md](README.md)
- 🇨🇳 **中文** - [README.zh.md](README.zh.md)
- 🇪🇸 **Español** - [README.es.md](README.es.md)
- 🇫🇷 **Français** - [README.fr.md](README.fr.md)
- 🇩🇪 **Deutsch** - [README.de.md](README.de.md)

📖 **Online-Dokumentation**: [skingflow-docs.pages.dev](https://skingflow-docs.pages.dev/)

## 🚀 Produktionsbereit

Das SkinFlow-Framework ist vollständig getestet mit den folgenden Produktionsmerkmalen:

- ✅ **Hohe Verfügbarkeit**: Vollständige Fehlerbehandlung und Degradierungsmechanismen
- ✅ **Hohe Leistung**: Asynchrone Stream-Verarbeitung und intelligentes Caching
- ✅ **Skalierbar**: Modulare Architektur, einfach zu erweitern
- ✅ **Überwachbar**: Detaillierte Protokolle und Statistiken
- ✅ **Sicherheit**: Virtuelles Dateisystem und Berechtigungssteuerung

## 📊 Benchmarks

| Metrik | Leistung |
|---------|-----------|
| Einfache Anfrageantwortzeit | < 2 Sekunden |
| Komplexe Aufgabenverarbeitungszeit | < 30 Sekunden |
| Gleichzeitige Verarbeitungskapazität | 100+ Anfragen/Minute |
| Speichernutzung | < 512MB |
| Erfolgsrate | > 95% |

## 🤝 Beitrag

Wir freuen uns über Community-Beiträge! Bitte lesen Sie den [Beitragsleitfaden](CONTRIBUTING.md), um zu erfahren, wie Sie an der Projektentwicklung teilnehmen können.

## 📞 Support

- **Dokumentation**: [Vollständige Dokumentation](docs/)
- **Beispiele**: [Beispielcode](examples/)
- **Problemfeedback**: [GitHub Issues](https://github.com/skingko/skingflow/issues)
- **Diskussionen**: [GitHub Discussions](https://github.com/skingko/skingflow/discussions)

## 📄 Lizenz

Dieses Projekt ist Open Source unter der MIT-Lizenz. Siehe [LICENSE](LICENSE)-Datei für Details.

---

**🎉 Beginnen Sie jetzt mit der Verwendung von SkinFlow zum Erstellen Ihrer intelligenten Anwendungen!**