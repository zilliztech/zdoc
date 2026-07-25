---
displayed_sidebar: cliSidebar
sidebar_label: Overview
slug: /cli/overview
beta: FALSE
notebook: FALSE
sidebar_position: 0
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Zilliz CLI Reference

The Zilliz Command Line Interface () provides a command-line tool for managing your Zilliz Cloud resources and performing data operations.

## Features

- **Cloud Management** - Manage clusters, projects, volumes, and backups
- **Configuration** - Configure authentication, alerts, and CLI settings
- **Data Operations** - Manage collections, databases, indexes, and perform vector searches

## Quick Start

### Install

<Tabs groupId="cli-install" defaultValue='linux' values={[{"label":"macOS / Linux","value":"linux"},{"label":"Windows","value":"windows"}]}>
<TabItem value="linux">

```bash
curl -fsSL https://raw.githubusercontent.com/zilliztech/zilliz-cli/master/install.sh | bash
```

</TabItem>
<TabItem value="windows">

```bash
irm https://raw.githubusercontent.com/zilliztech/zilliz-cli/master/install.ps1 | iex
```

</TabItem>
</Tabs>

### Authenticate

```bash
zilliz login
```

### Create a Cluster

```bash
zilliz cluster create --name my-cluster --type serverless
```

## Command Categories

### Cloud Management
- [Backup](/reference/cli/CloudManagement-Backup) - Create, restore, and manage backups
- [Cluster](/reference/cli/CloudManagement-Cluster) - Create, suspend, resume, and delete clusters
- [Import](/reference/cli/CloudManagement-Import) - Import data
- [Job](/reference/cli/CloudManagement-Job) - Manage jobs
- [Project](/reference/cli/CloudManagement-Project) - Manage projects
- [Volume](/reference/cli/CloudManagement-Volume) - Manage storage volumes

### Configuration
- [Auth](/reference/cli/Configuration-Auth) - Login, logout, and switch accounts
- [Configure](/reference/cli/Configuration-Configure) - Set and get configuration values
- [Context](/reference/cli/Configuration-Context) - Manage CLI contexts
- [Alert](/reference/cli/Configuration-Alert) - Create and manage alerts
- [Completion](/reference/cli/Configuration-Completion) - Shell completion setup

### Data Operations
- [Collection](/reference/cli/DataOperations-Collection) - Create, describe, and manage collections
- [Database](/reference/cli/DataOperations-Database) - Manage databases
- [Index](/reference/cli/DataOperations-Index) - Create and manage indexes
- [Partition](/reference/cli/DataOperations-Partition) - Create and manage partitions
- [Role](/reference/cli/DataOperations-Role)
- [User](/reference/cli/DataOperations-User) - Manage users
- [Vector](/reference/cli/DataOperations-Vector) - Insert, search, and query vectors



## Get Started

- [Authenticate](/reference/cli/cli/Auth-login)
- [Create a Cluster](/reference/cli/cli/Cluster-create)
- [Create a Collection](/reference/cli/cli/Collection-create)
