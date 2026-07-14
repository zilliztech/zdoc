---
title: "create | Cloud"
slug: /cli/cli/Volume-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は新しい volume を作成します。 | Cloud"
type: docx
token: H86odvFbDomzPjxjOtCc75jDnGf
sidebar_position: 1
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

この操作は新しい volume を作成します。

## Description\{#description}

volume は、構造化データまたは非構造化データファイルの collection を保持するオブジェクトストアです。これにより、これらのデータ資産にアクセスし、保存し、管理し、整理するための統一された場所が提供されます。ローカルファイルシステムまたはクラウドオブジェクトストレージ内の構造化データと非構造化データは、まず Zilliz Cloud の volume にアップロードされます。そこから、構造化データを直接 collection にインポートまたは移行したり、ETL パイプラインを実行して非構造化データを embedding に変換し、その embedding を collection にロードしたりできます。

オプションを指定せずにこのコマンドを実行すると、コマンドを設定するための一連の対話型プロンプトが開始されます。

## Synopsis\{#synopsis}

```bash
zilliz volume create
--project-id <value>
--region <value>
--name <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--project-id** (*string*) -

    **[REQUIRED]**

    project ID を示します。

    `zilliz context set` を使用して project が設定されている場合、このオプションが未設定であれば自動的に適用されます。

- **--region** (*string*) -

    **[REQUIRED]**

    クラウドリージョンを示します。たとえば、`aws-us-west-2` です。

    指定可能な値:

    - `aws-us-east-1`

    - `aws-us-east-2`

    - `aws-us-west-2`

    - `aws-ca-central-1`

    - `aws-eu-central-1`

    - `aws-eu-west-1`

    - `aws-ap-northeast-1`

    - `aws-ap-southeast-1`

    - `aws-ap-southeast-2`

    - `gcp-us-west1`

    - `gcp-us-east4`

    - `gcp-us-central1`

    - `gcp-asia-southeast1`

    - `az-eastus`

    - `az-eastus2`

    - `az-centralus`

    - `az-germanywestcentral`

    - `az-northeurope`

    - `az-centralindia`

- **--name** (*string*) -

    **[REQUIRED]**

    volume 名を示します。 

    値は英字で始まる、最大 **255** 文字の英数字文字列です。

- **--output, -o** (*string*) -

    出力形式を示します。指定可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを示します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を示します。

## Example\{#example}

```bash
zilliz volume create --project-id proj-xxxx \
--region aws-us-west-2 \
--name my-volume
```
