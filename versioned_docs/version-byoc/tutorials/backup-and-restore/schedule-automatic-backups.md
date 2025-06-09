---
title: "Schedule Automatic Backups | BYOC"
slug: /schedule-automatic-backups
sidebar_label: "Schedule Automatic Backups"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud allows you to enable automatic backups for your clusters, ensuring data recovery in case of unexpected mishaps. Regular backup prevent data loss and allow easy recovery to a specific point in time, giving you more control over your data. | BYOC"
type: origin
token: HDmKwGeGLi2P67kGdNXcigXDn3e
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - automatic
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Schedule Automatic Backups

Zilliz Cloud allows you to enable automatic backups for your clusters, ensuring data recovery in case of unexpected mishaps. Regular backup prevent data loss and allow easy recovery to a specific point in time, giving you more control over your data.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You are granted the [Organization Owner](./organization-users) or [Project Admin](./project-users) role in the target organization.

## Create backup schedule{#create-backup-schedule}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

To create a backup schedule, follow these steps:

1. Go to the **Backups** tab of your cluster and click on **Automatic** **Backup**.

1. In the **Automatic Backup Settings** dialog box that appears, switch on **Enable Automatic Backup**.

1. Set the **Frequency**, **Backup Retention Period**, and the time window for automatic backups.

![create-snapshot-schedule](/img/create-snapshot-schedule.png)

</TabItem>
<TabItem value="Bash">

You can set a backup policy to enable automatic backups at regular intervals. 

The following code creates a backup policy that will execute backups on 4 specific weekdays (Monday, Tuesday, Wednesday, and Friday). For details on parameters, refer to [Set Backup Policy](/reference/restful/set-backup-policy-v2).

```bash
curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/policy" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "frequency": "1,2,3,5",
        "startTime": "02:00-04:00",
        "retentionDays": 7,
        "enabled": true
      }'
```

Expected output:

```bash
{
  "code": 0,
  "data": {
    "clusterId": "in01-3e5ad8adc38xxxx",
    "status": "ENABLED"
  }
}
```

</TabItem>
</Tabs>

## Adjust automated backup schedule{#adjust-automated-backup-schedule}

The automated backup schedule settings are cluster-specific and disabled by default.

The default setting configures that Zilliz Cloud automatically creates a backup file for your cluster every day (**Frequency**) between 8 a.m. and 10 a.m. (**Time Period**), and keeps the backup file for 7 days (**Retention Period**). Change the settings as you see fit.

<Admonition type="info" icon="📘" title="Notes">

<p>The maximum retention period for automatically created backups is 30 days.</p>

</Admonition>

## Delete automatically created backup file{#delete-automatically-created-backup-file}

Dropping a cluster will remove all auto-created backup files of this cluster. Also, the auto-created backup files are removed when they reach the end of their retention period. If you need to manually delete auto-created backup files, refer to [Delete Backup File](./delete-snapshot).

## Related topics{#related-topics}

- [Create Snapshot](./create-snapshot)

- [View Snapshot Details](./view-snapshot-details)

- [Restore from Snapshot](./restore-from-snapshot)

- [Delete Snapshot](./delete-snapshot) 

