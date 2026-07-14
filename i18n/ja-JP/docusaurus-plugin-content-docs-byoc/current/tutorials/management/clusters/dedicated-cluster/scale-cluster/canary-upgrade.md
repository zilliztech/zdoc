---
title: "スケーリングのための Canary Upgrade アプローチ | BYOC"
slug: /canary-upgrade
sidebar_label: "Canary Upgrade"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud はスケーリング操作に canary upgrade アプローチを使用します。プラットフォームはまず限定された範囲でターゲット構成を検証し、その後、ヘルスチェックに合格した後に段階的にロールアウトします。 | BYOC"
type: origin
token: JzapwWCp7iRPDhky5qWczpTonZf
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# スケーリングのための Canary Upgrade アプローチ

Zilliz Cloud は、スケーリング操作に **canary upgrade** アプローチを使用します。プラットフォームはまず限定された範囲でターゲット構成を検証し、その後、ヘルスチェックに合格した後に段階的にロールアウトします。

Query CU を増減したり、レプリカを変更したりすると、Zilliz Cloud は新しい構成の準備と検証を行う間、クラスターを `Modifying` 状態にします。目的は、問題を早期に検出し、各ロールアウトステップの影響範囲を限定することで、サービスへの影響を減らすことです。

## Canary upgrade が重要な理由\{#why-canary-upgrade-matters}

Canary upgrade は、変更を広範囲に適用する前に、プラットフォームがターゲットリソースが正常であることを検証する必要があるスケーリング変更向けに設計されています。

- Query CU の増加または減少

- レプリカの増加または減少

- 手動、スケジュール、または動的スケーリングによる serving リソースの調整

| メリット | 説明 |
| --- | --- |
| 初期の影響範囲が小さい | 新しい構成はまず限定された範囲に導入されるため、変更を拡大する前に潜在的な問題を検出できます。 |
| ヘルスチェックに基づくロールアウト | Zilliz Cloud は、次のロールアウトステップに進む前に readiness と serving の健全性を確認します。 |
| 段階的なトラフィック移行 | canary ステージが正常になった後、トラフィックは徐々に移行されるため、急激なキャパシティやレイテンシの変動が発生する可能性を低減します。 |
| ロールバック経路 | canary が検証に合格しない場合、Zilliz Cloud はロールアウトを停止し、以前の利用可能な構成を引き続き使用できます。 |

## 仕組み\{#how-it-works}

![ITCnb4yRSoNlvgxb5cGcLjNInig](https://zdoc-images.s3.us-west-2.amazonaws.com/itcnb4yrsonlvgxb5cgcljninig.png "ITCnb4yRSoNlvgxb5cGcLjNInig")

canary upgrade を使用するスケーリング操作は、一般的に次のシーケンスに従います。

| ステージ | 内容 |
| --- | --- |
| 以前の構成 | スケーリングジョブの開始中も、以前の利用可能な構成が引き続き serving を行います。 |
| ターゲットの準備 | Zilliz Cloud はターゲットの Query CU またはレプリカ構成を準備します。 |
| 限定的な canary | プラットフォームはまず限定された範囲で新しいリソースを検証します。 |
| ヘルスゲート | チェックに失敗した場合、ロールアウトは停止し、クラスターは以前の利用可能な構成を引き続き使用します。 |
| 段階的なロールアウト | チェックに合格した場合、Zilliz Cloud はスケーリングジョブが完了するまで、制御されたステップでロールアウトを拡大します。 |

1. **以前の構成を利用可能なまま維持する**
   スケーリングジョブの開始中も、クラスターは以前の利用可能な構成で serving を継続します。この期間中、クラスターは `Modifying` 状態になることがあります。

1. **ターゲット構成を準備する**
   Zilliz Cloud は、ターゲットの Query CU またはレプリカ構成に必要なリソースをプロビジョニングし、準備します。

1. **限定的な canary を実行する**
   プラットフォームはまず限定された範囲で新しいリソースを検証します。canary ステージでは、新しいリソースが必要なデータをロードし、serving 状態を復元し、readiness とヘルスチェックに合格できるかどうかを確認します。

1. **canary の健全性を確認する**
   Zilliz Cloud は、readiness、serving の健全性、移行時の挙動について canary を監視します。canary が期待される健全性基準を満たさない場合、ロールアウトは進行しません。

1. **変更を段階的にロールアウトする**
   canary が正常になった後、Zilliz Cloud はロールアウトを拡大し、制御されたステップで serving トラフィックをターゲット構成へ移行します。

1. **スケーリングジョブを完了する**
   ターゲット構成が完全にアクティブかつ正常になると、スケーリングジョブは完了します。不要になったリソースは、serving パスから外れた後にクリーンアップされます。

## Canary upgrade と cloud-native storage\{#canary-upgrade-and-cloud-native-storage}

cloud-native storage は、永続データがコンピュートリソースから分離されているため、canary ベースのスケーリングをより安全にします。

多くの従来型ステートフルシステムでは、新しいノードを追加する際に、既存のノードがローカルデータを新しいノードにリバランスする必要があります。その期間中、既存のノードはオンライントラフィックへの serving とデータ転送を同時に行う必要があるため、CPU、メモリ、ディスク I/O、ネットワークへの負荷が増加する可能性があります。

Zilliz Cloud では、永続データはオブジェクトストレージに保存されます。新しいリソースは、serving トラフィックに参加する前に、必要なデータを独立してロードできます。これにより、canary ステージでは、既存の serving ノードをローカルデータ転送元に依存することなく、新しいリソースを検証できます。

## スケーリング中に気付く可能性があること\{#what-you-may-notice-during-scaling}

canary upgrade ベースのスケーリング操作中は、次のようなことが発生する可能性があります。

- クラスターのステータスが `Modifying` に変わる場合があります。

- canary の準備と検証が行われている間も、通常は既存のサービスが以前の利用可能な構成で継続して稼働します。

- 一部の管理操作が一時的に利用できなくなる場合があります。

- ロールアウトステージ間でトラフィックが移行される際に、わずかなサービスの揺らぎが発生する場合があります。

- 新しい構成は、スケーリングジョブが正常に完了した後にのみ有効になります。

- canary または後続のロールアウトステージを正常に完了できない場合、クラスターは以前の利用可能な構成を引き続き使用します。

<Admonition type="info" icon="📘" title="注">

Canary upgrade はスケーリング中のサービス影響を軽減しますが、すべての操作で完全に揺らぎがないことを保証するものではありません。レイテンシに敏感な本番ワークロードでは、可能であればトラフィックの少ない時間帯に大規模なスケーリング変更を実施してください。

</Admonition>
