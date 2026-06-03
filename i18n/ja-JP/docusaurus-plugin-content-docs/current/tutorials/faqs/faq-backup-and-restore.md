---
title: "FAQ: バックアップと復元 | CLOUD"
slug: /faq-backup-and-restore
sidebar_label: "FAQ: バックアップと復元"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud でデータをバックアップおよび復元する際に発生する可能性のある問題と、それに対応する解決策を一覧で紹介します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 7

---

# FAQ: バックアップと復元

このトピックでは、Zilliz Cloud でデータをバックアップおよび復元する際に発生する可能性のある問題と、それに対応する解決策を一覧で紹介します。

## 目次

- [バックアップ機能は Standard プランで利用できますか？](#is-the-backup-feature-available-in-the-standard-plan)
- [クラスターバックアップを復元するときに Milvus バージョンを選択できますか？](#can-i-choose-the-milvus-version-when-restoring-a-cluster-backup)

## よくある質問




### バックアップ機能は Standard プランで利用できますか？\{#is-the-backup-feature-available-in-the-standard-plan}

はい。バックアップの作成は、**Standard** プロジェクトの **Dedicated** クラスターで利用できます。

### クラスターバックアップを復元するときに Milvus バージョンを選択できますか？\{#can-i-choose-the-milvus-version-when-restoring-a-cluster-backup}

- 過去 30 日以内に作成されたバックアップファイルについて、元のクラスターが現在利用可能な最新 GA バージョンより前の Milvus GA バージョンを使用していた場合、復元先クラスターの Milvus バージョンを選択できます。デフォルトでは、Zilliz Cloud はクラスターを最新の GA Milvus バージョンに復元します。

- 30 日より前に作成されたバックアップファイル、またはすでに最新の Milvus GA バージョンを使用しているバックアップファイルでは、ターゲットの Milvus バージョンを変更できません。

たとえば、現在利用可能な最新の Milvus GA バージョンが 2.6.x だとします。

- 過去 30 日以内に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元しますが、2.5.x に復元するよう選択できます。

- 30 日より前に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元し、ターゲットの Milvus バージョンは変更できません。

- 2.6.x のバックアップファイルから復元する場合、Zilliz Cloud は新しいクラスターを 2.6.x に復元し、ターゲットの Milvus バージョンは変更できません。
