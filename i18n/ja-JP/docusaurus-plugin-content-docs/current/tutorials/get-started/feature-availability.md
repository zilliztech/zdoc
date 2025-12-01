---
title: "機能の利用可能性 | Cloud"
slug: /feature-availability
sidebar_label: "機能の利用可能性"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "最終更新日: 2025年10月13日 | Cloud"
type: origin
token: HpbSwzS6kiW9gikHpQ0cUZLWnlc
sidebar_position: 15
keywords:
  - zilliz
  - vector database
  - cloud
  - feature availability
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database

---

import Admonition from '@theme/Admonition';


# 機能の利用可能性

*最終更新日: 2025年10月13日*

ある機能の**利用可能段階**は、Zilliz Cloudにおけるその機能の成熟度、安定性、推奨される使用方法を示します。以下は機能のライフサイクル段階の概要と、ユーザーとしてのあなたにとってそれが何を意味するかです。

![YBh6wiorGhbetoba42DchATjnVm](/img/YBh6wiorGhbetoba42DchATjnVm.png)

- **プライベートプレビュー:**

    - **定義:** プライベートプレビュー中の機能は、現在開発中で変更される可能性があります。Zilliz Cloud内で実装およびテストされているものの、完全なユーザビリティ、安定性、および境界ケースのカバーが完了していない場合があります。

    - **アクセス:** デフォルトでは利用できません。アクセスをリクエストするには、[Zillizサポート](http://support.zilliz.com)までお問い合わせください。

    - **使用方法:** 本番ワークロードでの使用は想定されていません。

- **パブリックプレビュー:**

    - **定義:** パブリックプレビュー中の機能は、本番環境に近い状態になり、一般提供（GA）になる前に大幅に変更されることはほぼありません。

    - **アクセス:** クラスターミルヴスのバージョンアップ後にデフォルトで有効になります。クラスターが古いバージョンのミルヴスで実行されている場合、一部の機能は利用できません。その場合は、[サポートに連絡](http://support.zilliz.com)してクラスターをアップグレードしてください。

    - **使用方法:** 本番環境での使用は推奨されません。

- **一般提供（GA）:**

    - **定義:** GA機能は完全にリリースされており、本番環境に対応し、アクティブにサポートされています。

    - **アクセス:** 多くのユーザーではデフォルトで有効になっていますが、価格設定の考慮が必要なエンタープライズ機能など一部の機能は、有効化するため[営業担当に連絡](https://zilliz.com/contact-sales)が必要です。

    - **使用方法:** 本番環境向け。

- **非推奨通知:**

    - **定義:** この段階の機能は、まだ機能し利用可能ですが、致命的なバグ修正以外はアクティブ開発されていません。

    - **アクセス:** まだ利用可能ですが、正式な非推奨発表がメールで発行されています。

    - **使用方法:** 機能が将来の日付で削除されるため、[当社の専門家に相談](https://zilliz.com/contact-sales)して新しいソリューションへの移行を開始してください。

- **非推奨:**

    - **定義:** 機能は完全にZilliz Cloudから削除されており、利用もサポートもされていません。

    - **アクセス:** 利用できません。

## 機能の利用可能段階の識別方法\{#how-to-identify-a-features-availability-phase}

各機能の利用可能段階は、対応するラベルでZilliz Cloudのドキュメントに示されます。特に明記されていない限り、機能は一般提供中と見なされます。

## 現在の機能利用可能性\{#current-feature-availability}

### プライベートプレビュー\{#private-preview}

- [ステージ](./manage-stages)

- [抽出、変換、ロード（ETL）](/reference/restful/merge-data-v2)

- [ダウンタイムゼロでの移行](./zero-downtime-migration)

- [バックアップファイルのエクスポート](./export-backup-files)

<Admonition type="info" icon="📘" title="注釈">

<p>これらの機能へのアクセスをリクエストするには、<a href="http://support.zilliz.com">Zillizサポート</a>にお問い合わせください。</p>

</Admonition>

### パブリックプレビュー\{#public-preview}

- [JSONインデックス](./use-json-fields)

- [JSONシャレディング](./json-shredding)

- [既存のコレクションにフィールドを追加](./add-fields-to-an-existing-collection)

- [ブーストレンカー](./boost-ranker)

- [減衰ランカー](./decay-ranker-oveview)

- [INT8_VECTORデータ型](./use-dense-vector)

- [Ngramインデックス](./ngram-index-type)

- [MINHASH_LSHインデックス](./minhash-lsh)

- [多言語アナライザー](./multi-language-analyzers)

- [階層ストレージクラスタータイプ](./cu-types-explained)

- [ジオメトリーフィールド](./use-geometry-field)

- [構造体の配列](./use-array-of-structs)

<Admonition type="info" icon="📘" title="注釈">

<p>これらの機能にアクセスするには、クラスターミルヴスのバージョンをアップグレードしてください。</p>

</Admonition>

### 非推奨通知\{#deprecation-notice}

- [NumPyファイルからのデータインポート](./data-import-numpy)

- [RESTful API（V1）](/reference/restful/v1)

### 非推奨\{#deprecated}

- パイプライン