---
displayed_sidbar: cliSidebar
title: "update-policy | Cloud"
slug: /cli/cli/Backup-updatepolicy
sidebar_label: "update-policy"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation updates the backup policy of a cluster. | Cloud"
type: docx
token: TVB4dJXYfoSiFexcIFwcez5dnug
sidebar_position: 9
keywords: 
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - update-policy
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# update-policy

This operation updates the backup policy of a cluster.

## Description

Zilliz Cloud allows you to enable **automatic backups** for your clusters, helping ensure data recovery in case of unexpected issues. Automatic backups apply to the **entire cluster**—backing up individual collections automatically is not supported.

You can run this command to update the automatic backup policy. Running this command without options will trigger a set of interactive prompts.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters.</p>

</Admonition>

## Synopsis

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

## Options

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates the cluster ID, which is similar to `inxx-xxxxx`.

    If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--auto-backup** (*boolean*) -

    **[REQUIRED]**

    Indicates whether to enable or disable auto-backup.

- **--frequency** (*string*) -

    Indicates how frequently to run an auto-backup job. This option is required when `--auto-backup` is `true`. Possible values are:

    - `daily`

    - `weekdays`

    - `weekends`, or

    - `1-7` (1=Mon, 7=Sun) For example, `1,3,5`.

- **--start-time** (*string*) -

    Indicates the start hour in UTC, for example, `02:00`. This option is required when `--auto-backup` is `true`.

- **--retention-days** (*integer*) -

    days to retain backups (1-30) Required when `--auto-backup` is `true`.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

- **--body** (*string*) -

    A raw JSON string that matches the following schema. For concrete examples, refer to [Set Backup Policy](/reference/restful/set-backup-policy-v2).

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
                            "example": "ali-cn-hangzhou"
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

## Example

```bash
# Enable daily backup at 2am UTC with 7-day retention
zilliz backup update-policy --cluster-id in01-xxxx \
--auto-backup true \
--frequency daily \
--start-time 02:00 \
--retention-days 7

# Enable backup on Mon/Wed/Fri at 3am UTC
zilliz backup update-policy \
--cluster-id in01-xxxx \
--auto-backup true \
--frequency 1,3,5 \
--start-time 03:00-05:00 \
--retention-days 14

# Disable auto-backup
zilliz backup update-policy --cluster-id in01-xxxx --auto-backup false
```
