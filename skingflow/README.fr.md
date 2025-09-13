# SkinFlow Multi-Agent Framework

> 🚀 **Moteur de flux flexible pour applications multi-agents intelligentes** - Prend en charge la décomposition de tâches complexes, la planification intelligente, la gestion de mémoire et l'intégration d'outils

[![Licence: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Statut du Framework](https://img.shields.io/badge/status-production--ready-green.svg)]()
[![Documentation](https://img.shields.io/badge/docs-online-blue.svg)](https://skingflow-docs.pages.dev/)
[![Version NPM](https://img.shields.io/npm/v/skingflow.svg)](https://www.npmjs.com/package/skingflow)

## 📖 Table des Matières

- [Démarrage Rapide](#démarrage-rapide)
- [Fonctionnalités Principales](#fonctionnalités-principales)
- [Aperçu de l'Architecture](#aperçu-de-larchitecture)
- [Documentation](#documentation)
- [Exemples](#exemples)
- [Support Linguistique](#support-linguistique)

## 🚀 Démarrage Rapide

### Expérience Rapide en 5 Minutes

```bash
# 1. Cloner le dépôt
git clone https://github.com/skingko/skingflow.git
cd skingflow

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer le fichier .env pour définir votre clé API LLM et la connexion à la base de données

# 4. Exécuter l'exemple
node examples/quick-start/index.js
```

### Exemple d'Utilisation Simple

```javascript
import { createMultiAgentFramework } from './lib/multi-agent/index.js';

// Créer une instance du framework
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

// Traiter la requête
const result = await framework.processRequest(
  "Créer une application web simple",
  { userId: 'user123' }
);

console.log(result);
```

## ✨ Fonctionnalités Principales

### 🧠 Système Multi-Agents Intelligent
- **Agent de Planification**: Décompose automatiquement les tâches complexes et crée des plans d'exécution
- **Sous-Agents Professionnels**: Spécialisés en recherche, programmation, analyse de données, création de contenu
- **Coordination Intelligente**: Sélectionne automatiquement les agents les plus appropriés pour des tâches spécifiques
- **Isolation de Contexte**: Assure une collaboration sécurisée entre les agents

### 💾 Système de Mémoire Avancé (architecture basée sur mem0)
- **Mémoire à Court Terme**: Gestion du contexte de session et des informations temporaires
- **Mémoire à Long Terme**: Stockage persistant des connaissances et des historiques
- **Préférences Utilisateur**: Paramètres personnalisés et apprentissage des habitudes
- **Recherche Sémantique**: Récupération intelligente de mémoire basée sur les vecteurs

### 🛠️ Système d'Outils Unifié
- **Définitions d'Outils YAML/XML**: Configuration déclarative d'outils, facile à étendre
- **Système de Fichiers Virtuel**: Environnement sécurisé pour les opérations sur fichiers
- **Support du Protocole MCP**: Intégration standardisée d'outils
- **Outils Personnalisés**: Mécanisme flexible de développement et d'intégration d'outils

### 🔄 Moteur de Traitement de Flux
- **Traitement Asynchrone de Flux**: Exécution concurrente haute performance
- **Réponse en Temps Réel**: Supporte la sortie en streaming et le retour en temps réel
- **Orchestration de Flux de Travail**: Gestion intelligente de flux de travail complexes

### 🛡️ Fiabilité Entreprise
- **Mécanisme de Dégradation**: Stratégies de récupération d'erreurs multicouches
- **Disjoncteur**: Isolation et récupération automatiques des pannes
- **Surveillance de Santé**: Suivi en temps réel de l'état du système
- **Journalisation Détaillée**: Informations complètes de débogage et d'audit

## 🏗️ Aperçu de l'Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SkinFlow Framework                        │
├─────────────────────────────────────────────────────────────┤
│  Système Multi-Agents                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Agent de    │  │ Gestionnaire│  │ Système de  │         │
│  │ Planification│ des Sous-     │  │ Coordination│         │
│  │             │  │ Agents      │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Services Centraux                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Abstraction │  │ Système de  │  │ Registre    │         │
│  │ LLM         │  │ Mémoire     │  │ d'Outils    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Gestionnaire│  │ Système de  │  │ Moteur de   │         │
│  │ de Secours  │  │ Fichiers    │  │ Flux        │         │
│  │             │  │ Virtuel     │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 📚 Documentation

- **[Guide d'Installation](docs/installation.md)** - Étapes détaillées d'installation et de configuration
- **[Tutoriel d'Utilisation de Base](docs/basic-usage.md)** - Tutoriel étape par étape d'utilisation
- **[Configuration Avancée](docs/advanced-config.md)** - Fonctionnalités avancées et configuration personnalisée
- **[Système d'Outils](docs/tools.md)** - Guide de développement et d'intégration d'outils
- **[Système de Mémoire](docs/memory.md)** - Explication détaillée de la gestion de mémoire
- **[Système d'Agents](docs/agents.md)** - Mécanisme de collaboration multi-agents
- **[Référence API](docs/api-reference.md)** - Documentation API complète
- **[Meilleures Pratiques](docs/best-practices.md)** - Recommandations pour environnement de production
- **[Dépannage](docs/troubleshooting.md)** - Solutions aux problèmes courants

## 🎯 Exemples

- **[Démarrage Rapide](examples/quick-start/)** - Exemple d'utilisation le plus simple
- **[Assistant Intelligent](examples/intelligent-assistant/)** - Application complète d'assistant intelligent
- **[Création de Contenu](examples/content-creation/)** - Génération automatisée de contenu
- **[Analyse de Données](examples/data-analysis/)** - Traitement intelligent de données
- **[Générateur d'Applications Web](examples/web-app-generator/)** - Développement web automatisé

## 🌐 Support Linguistique

Ce projet supporte plusieurs langues :

- 🇺🇸 **English** - [README.md](README.md)
- 🇨🇳 **中文** - [README.zh.md](README.zh.md)
- 🇪🇸 **Español** - [README.es.md](README.es.md)
- 🇫🇷 **Français** - [README.fr.md](README.fr.md)
- 🇩🇪 **Deutsch** - [README.de.md](README.de.md)

📖 **Documentation en Ligne**: [skingflow-docs.pages.dev](https://skingflow-docs.pages.dev/)

## 🚀 Prêt pour la Production

Le framework SkinFlow est entièrement testé avec les caractéristiques de production suivantes :

- ✅ **Haute Disponibilité**: Gestion complète des erreurs et mécanismes de dégradation
- ✅ **Haute Performance**: Traitement asynchrone de flux et cache intelligent
- ✅ **Évolutif**: Architecture modulaire, facile à étendre
- ✅ **Surveillable**: Journaux détaillés et statistiques
- ✅ **Sécurité**: Système de fichiers virtuel et contrôle des permissions

## 📊 Points de Référence

| Métrique | Performance |
|---------|-------------|
| Temps de réponse de requête simple | < 2 secondes |
| Temps de traitement de tâche complexe | < 30 secondes |
| Capacité de traitement concurrent | 100+ requêtes/minute |
| Utilisation mémoire | < 512MB |
| Taux de succès | > 95% |

## 🤝 Contribution

Nous accueillons les contributions de la communauté ! Veuillez consulter le [Guide de Contribution](CONTRIBUTING.md) pour apprendre comment participer au développement du projet.

## 📞 Support

- **Documentation**: [Documentation Complète](docs/)
- **Exemples**: [Code d'Exemple](examples/)
- **Retour sur les Problèmes**: [GitHub Issues](https://github.com/skingko/skingflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/skingko/skingflow/discussions)

## 📄 Licence

Ce projet est open source sous la Licence MIT. Voir le fichier [LICENSE](LICENSE) pour les détails.

---

**🎉 Commencez à utiliser SkinFlow pour construire vos applications intelligentes !**