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

### [Cloud Management](./CloudManagement/CloudManagement-Cluster/Cluster-create)

- [Backup](./CloudManagement/CloudManagement-Backup/Backup-create) - Create, restore, and manage backups
- [Billing](./CloudManagement/CloudManagement-Billing/Billing-bindcard) - View invoices and usage
- [Cluster](./CloudManagement/CloudManagement-Cluster/Cluster-create) - Create, suspend, resume, and delete clusters
- [Project](./CloudManagement/CloudManagement-Project/Project-create) - Manage projects
- [Volume](./CloudManagement/CloudManagement-Volume/Volume-create) - Manage storage volumes

### [Configuration](./Configuration/Configuration-Auth/Auth-login)

- [Auth](./Configuration/Configuration-Auth/Auth-login) - Login, logout, and switch accounts
- [Configure](./Configuration/Configuration-Configure/Configure-clear) - Set and get configuration values
- [Context](./Configuration/Configuration-Context/Context-current) - Manage CLI contexts
- [Alert](./Configuration/Configuration-Alert/Alert-create) - Create and manage alerts

### [Data Operations](./DataOperations/DataOperations-Collection/Collection-create)

- [Collection](./DataOperations/DataOperations-Collection/Collection-create) - Create, describe, and manage collections
- [Database](./DataOperations/DataOperations-Database/Database-create) - Manage databases
- [Index](./DataOperations/DataOperations-Index/Index-create) - Create and manage indexes
- [Vector](./DataOperations/DataOperations-Vector/Vector-delete) - Insert, search, and query vectors
- [User/Role](./DataOperations/DataOperations-Role/Role-create) - Manage users and roles

## Get Started

- [Authenticate](./Configuration/Configuration-Auth/Auth-login)
- [Create a Cluster](./CloudManagement/CloudManagement-Cluster/Cluster-create)
- [Create a Collection](./DataOperations/DataOperations-Collection/Collection-create)
