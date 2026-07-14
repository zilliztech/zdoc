---
title: "update-policy | Cloud"
slug: /cli/cli/Backup-updatepolicy
sidebar_label: "update-policy"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はクラスターのバックアップポリシーを更新します。 | Cloud"
type: docx
token: PJsSdI8JBoUchVx1IkrcmakLnCc
sidebar_position: 9
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - cloud
  - update-policy
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# update-policy

この操作はクラスターのバックアップポリシーを更新します。

## Description\{#description}

Zilliz Cloud では、クラスターに対して **自動バックアップ** を有効にでき、予期しない問題が発生した場合のデータ復旧を支援します。自動バックアップは **クラスター全体** に適用され、個別のコレクションを自動的にバックアップすることはサポートされていません。

このコマンドを実行して自動バックアップポリシーを更新できます。オプションを指定せずにこのコマンドを実行すると、一連の対話型プロンプトが開始されます。

<Admonition type="info" icon="📘" title="注意">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz backup update-policy
--cluster-id <value>
--auto-backup
--frequency <value>
--start-time <value>
--rentention-days <value>
[--output <value>]
[--query <value>]
[--no-header]
[--body <value>]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    `inxx-xxxxx` のようなクラスター ID を示します。

    `zilliz context set` を使用してクラスターが設定されている場合、このオプションを設定しなくても自動的に適用されます。

- **--auto-backup** (*boolean*) -

    **[REQUIRED]**

    自動バックアップを有効にするか無効にするかを示します。

- **--frequency** (*string*) -

    自動バックアップジョブを実行する頻度を示します。このオプションは `--auto-backup` が `true` の場合に必須です。指定可能な値は次のとおりです。

    - `daily`

    - `weekdays`

    - `weekends`, または

    - `1-7` (1=月曜、7=日曜) 例: `1,3,5`。

- **--start-time** (*string*) -

    UTC での開始時刻を示します。たとえば `02:00` です。このオプションは `--auto-backup` が `true` の場合に必須です。

- **--retention-days** (*integer*) -

    バックアップを保持する日数 (1～30) を示します。`--auto-backup` が `true` の場合に必須です。

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

    出力をフィルタリングする JMESPath 式を示します。

- **--body** (*string*) -

    次のスキーマに一致する生の JSON 文字列です。具体例については、[バックアップポリシーの設定](/reference/restful/set-backup-policy-v2) を参照してください。

    ```json
    {
        "type": "object",
        "properties": {
            "frequency": {
                "type": "string",
                "example": "1,2,5"
            },
            "startTime": {
                "type": "string",
                "example": "02:00-04:00"
            },
            "retentionDays": {
                "type": "integer",
                "minimum": 1,
                "maximum": 30,
                "example": 7
            },
            "enabled": {
                "type": "boolean",
                "example": true
            },
            "crossRegionCopies": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "regionId": {
                            "type": "string",
                            "example": "aws-us-west-2"
                        },
                        "retentionDays": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 30,
                            "example": 7
                        }
                    }
                }
            }
        },
        "required": [
            "enabled"
        ]
    }
    ```

## Example\{#example}

```bash
# UTC午前2時に毎日バックアップを有効化し、保持期間を7日に設定
zilliz backup update-policy --cluster-id in01-xxxx \
--auto-backup true \
--frequency daily \
--start-time 02:00 \
--retention-days 7

# 月/水/金のUTC午前3時にバックアップを有効化
zilliz backup update-policy \
--cluster-id in01-xxxx \
--auto-backup true \
--frequency 1,3,5 \
--start-time 03:00-05:00 \
--retention-days 14

# 自動バックアップを無効化
zilliz backup update-policy --cluster-id in01-xxxx --auto-backup false
```
