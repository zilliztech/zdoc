---
title: "Zilliz CLI | Cloud"
slug: /cli/cli/overview
sidebar_label: "Overview"
sidebar_position: 0
---

# Zilliz CLI

The [Zilliz Command Line Interface (CLI)](https://github.com/zilliztech/zilliz-cli) provides a command-line tool for managing your Zilliz Cloud resources and performing data operations.

## Features

- **Cloud Management** - Manage clusters, projects, volumes, and backups
- **Configuration** - Configure authentication, alerts, and CLI settings
- **Data Operations** - Manage collections, databases, indexes, and perform vector searches

## Quick Start

### Install

```bash
pip install zilliz-cli
```

### Authenticate

```bash
zilliz login
```

### Create a Cluster

```bash
zilliz cluster create --name my-cluster --type serverless
```

## Command Categories

### [Cloud Management](./Cluster-create)

- [Backup](./Backup-create) - Create, restore, and manage backups
- [Billing](./Billing-bindcard) - View invoices and usage
- [Cluster](./Cluster-create) - Create, suspend, resume, and delete clusters
- [Project](./Project-create) - Manage projects
- [Volume](./Volume-create) - Manage storage volumes

### [Configuration](./Auth-login)

- [Auth](./Auth-login) - Login, logout, and switch accounts
- [Configure](./Configure-clear) - Set and get configuration values
- [Context](./Context-current) - Manage CLI contexts
- [Alert](./Alert-create) - Create and manage alerts

### [Data Operations](./Collection-create)

- [Collection](./Collection-create) - Create, describe, and manage collections
- [Database](./Database-create) - Manage databases
- [Index](./Index-create) - Create and manage indexes
- [Vector](./Vector-delete) - Insert, search, and query vectors
- [User/Role](./Role-create) - Manage users and roles

## Get Started

- [Authenticate](./Auth-login)
- [Create a Cluster](./Cluster-create)
- [Create a Collection](./Collection-create)
