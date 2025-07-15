---
title: "PineconeからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-pinecone
sidebar_label: "Pineconeから"
beta: FALSE
notebook: FALSE
description: "Pineconeは類似検索を可能にするベクトルデータベースです。PineconeからZilliz Cloudにデータを移行することで、Zilliz Cloudの高性能な検索と分析を活用しながら、密なベクトルと疎なベクトルの両方を管理する機能を強化することができます。 | Cloud"
type: origin
token: VQytwi51diZPF9kmcW7chhpqn0d
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - pinecone
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window

---

import Admonition from '@theme/Admonition';


# PineconeからZilliz Cloudへの移行

[Pinecone](https://www.pinecone.io/)は類似検索を可能にするベクトルデータベースです。PineconeからZilliz Cloudにデータを移行することで、Zilliz Cloudの高性能な検索と分析を活用しながら、密なベクトルと疎なベクトルの両方を管理する機能を強化することができます。

このガイドでは、Pineconeへの接続、データマッピングの設定、潜在的な問題のトラブルシューティングなど、PineconeからZilliz Cloudへのデータ移行の過程を説明します。

## 考慮事項{#considerations}

- PineconeからZilliz Cloudにデータを移行すると、ベクトルフィールドが直接転送され、PineconeのメタデータフィールドはZilliz Cloud上の動的フィールドにJSON形式で保存されます。動的フィールド機能の詳細については、「[ダイナミックフィールド](./enable-dynamic-field)」を参照してください。

- 互換性を確保するため、Auto IDは無効になり、Zilliz Cloud上の各ターゲットコレクションに対して変更することはできません。

- この移行はPineconeサーバーレスインデックスのみをサポートします。

- 各移行タスクは単一のソースPineconeインデックスに制限されます。複数のソースインデックスにデータがある場合は、それぞれに別々の移行ジョブを設定できます。

## 始める前に{#before-you-start}

- ソースのPineconeインデックスは一般のインターネットからアクセスできます。

- ネットワーク環境で許可リストが設定されている場合は、Zilliz CloudのIPアドレスが追加されていることを確認してください。詳細については、「[Zilliz CloudのIPアドレス](./zilliz-cloud-ips)」を参照してください。

- ターゲットPineconeプロジェクトにアクセスするためのAPIキーを取得しました。

- Zilliz Cloudでは、組織オーナーまたはプロジェクト管理者の役割が付与されています。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

## PineconeからZilliz Cloudへの移行{#migrate-from-pinecone-to-zilliz-cloud}

![migrate_from_pinecone](/img/migrate_from_pinecone.png)

ソースデータを任意のプランレベルのZilliz Cloudクラスタに移行できます(CU体格がソースデータに対応している場合)。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. ターゲットプロジェクトページに移動し、**移行**>**松ぼっくり**を選択してください。

1. 「**データソースに接続**」ステップで、ターゲットのPineconeプロジェクトにアクセスするために使用できるAPIキーを入力します。次に、「**次**へ」をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p><a href="https://docs.pinecone.io/reference/api/authentication">認証</a>により、必要な接続情報を取得することができます。</p>

    </Admonition>

1. 「**ソースとターゲットを選択**」ステップで、ソースのPineconeインデックスとターゲットのZilliz Cloudクラスタの設定を行います。次に、「**次**へ」をクリックしてください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>Pineconeから移行する各ソースインデックスには、ベクトルフィールドが含まれている必要があります。</p>

    </Admonition>

1. 「**スキーマ構成**」ステップでは、

    1. [**スキーマプレビュー**]で、Pineconeインデックスと対応するZilliz Cloudコレクションのフィールドマッピングを確認します。

        <Admonition type="info" icon="📘" title="ノート">

        <ul>
        <li><p>Auto IDは解除され、変更できません。</p></li>
        <li><p>PineconeのレコードIDは、Zilliz Cloud上の<code>VARCHAR</code>フィールドにプライマリフィールドとしてマップされ、<code>max_length</code>の範囲は1〜65,535バイトです。エンティティを挿入または挿入する場合は、<code>VARCHAR</code>フィールドの値がこの制限内に収まるようにしてください。</p></li>
        <li><p>フィールドの名前を変更することはできますが、データ型は固定されており、変更できません。</p></li>
        </ul>

        </Admonition>

    1. 「**詳細設定**」で、**ダイナミックフィールド**と**パーティションキー**の設定を確認してください。

        1. **ダイナミックフィールド**:デフォルトで有効になっており、変更できません。ソースインデックスからメタデータを保存し、一貫性を確保し、柔軟性を維持します。

        1. **パーティションキー**:デフォルトで有効になっています。有効にすると、Zilliz CloudはPinecone名前空間をパーティションキーにマップします。無効にすると、パーティションにマップされます。この機能を有効にしておくことをお勧めします。この状態では、名前空間はVARCHARデータ型を持つターゲットコレクションスキーマのスカラーフィールドとして表示されます。詳細については、「[パーティションキーを使う](./use-partition-key)」と「[パーティションの管理](./manage-partitions)」を参照してください。

    1. [**ターゲットコレクション名**と**説明**]で、ターゲットコレクション名と説明をカスタマイズします。コレクション名は、各クラスターで一意である必要があります。名前が既存の名前と重複する場合は、コレクション名を変更します。

1. [**移行**]をクリックします。

## 移行過程を監視する{#monitor-the-migration-process}

「**移行**」をクリックすると、移行ジョブが生成されます。[ジョブ](./job-center)ページで移行の進捗状況を確認できます。ジョブのステータスが「**IN PROGRESS**」から「**SUCCESS FUL**」に切り替わると、移行が完了します。

<Admonition type="info" icon="📘" title="ノート">

<p>移行後、ターゲットクラスタ内のコレクションとエンティティの数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除して再移行してください。</p>

</Admonition>

![verify_collection](/img/verify_collection.png)

## 移行ジョブをキャンセル{#cancel-migration-job}

移行過程で問題が発生した場合は、次の手順に従ってトラブルシューティングを行い、移行を再開できます。

1. [[ジョブ](./job-center)]ページで、失敗した移行ジョブを特定してキャンセルします。

1. [アクション]列の[**詳細**を**表示**]をクリックして、エラーログにアクセスします。

