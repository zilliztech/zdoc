---
title: "FAQ: バックアップと復元 | BYOC"
slug: /faq-backup-and-restore
sidebar_label: "FAQ: バックアップと復元"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud 上でデータをバックアップおよび復元する際に発生する可能性のある問題と、それに対応する解決方法を示します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 7
displayed_sidebar: default

---

# FAQ: バックアップと復元

このトピックでは、Zilliz Cloud 上でデータをバックアップおよび復元する際に発生する可能性のある問題と、それに対応する解決方法を示します。

## 目次

- [Standard プランでバックアップ機能は利用できますか？](#is-the-backup-feature-available-in-the-standard-plan)
- [クラスターのバックアップを復元する際に Milvus バージョンを選択できますか？](#can-i-choose-the-milvus-version-when-restoring-a-cluster-backup)

## FAQ




### Standard プランでバックアップ機能は利用できますか？\{#is-the-backup-feature-available-in-the-standard-plan}

はい。バックアップの作成は、**Standard** プロジェクト内の **Dedicated** クラスターで利用できます。

### クラスターのバックアップを復元する際に Milvus バージョンを選択できますか？\{#can-i-choose-the-milvus-version-when-restoring-a-cluster-backup}

- 過去 30 日以内に作成されたバックアップファイルについては、元のクラスターが最新の利用可能な Milvus GA バージョンより前の Milvus GA バージョンを使用していた場合、復元先クラスターの Milvus バージョンを選択できます。デフォルトでは、Zilliz Cloud はクラスターを最新の GA Milvus バージョンに復元します。

- 30 日より前に作成されたバックアップファイル、またはすでに最新の Milvus GA バージョンを使用しているバックアップファイルについては、対象の Milvus バージョンを変更できません。

たとえば、最新の利用可能な Milvus GA バージョンが 2.6.x であるとします。

- 過去 30 日以内に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元しますが、2.5.x に復元することも選択できます。

- 30 日より前に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元し、対象の Milvus バージョンを変更することはできません。

- 2.6.x のバックアップファイルから復元する場合、Zilliz Cloud は新しいクラスターを 2.6.x に復元し、対象の Milvus バージョンを変更することはできません。
