---
title: "FAQ: Backup and Restore | BYOC"
slug: /faq-backup-and-restore
sidebar_label: "FAQ: Backup and Restore"
beta: FALSE
notebook: FALSE
description: "This topic lists the possible issues that you may encounter while backing up and restoring data on Zilliz Cloud and the corresponding solution. | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 7
displayed_sidebar: default

---

# FAQ: Backup and Restore

This topic lists the possible issues that you may encounter while backing up and restoring data on Zilliz Cloud and the corresponding solution.

## Contents

- [Is the backup feature available in the Standard plan?](#is-the-backup-feature-available-in-the-standard-plan)
- [Can I choose the Milvus version when restoring a cluster backup?](#can-i-choose-the-milvus-version-when-restoring-a-cluster-backup)

## FAQs




### Is the backup feature available in the Standard plan?\{#is-the-backup-feature-available-in-the-standard-plan}

Yes. Creating backups is available to **Dedicated** clusters in a **Standard** project.

### Can I choose the Milvus version when restoring a cluster backup?\{#can-i-choose-the-milvus-version-when-restoring-a-cluster-backup}

- For backup files created within the last 30 days, if the original cluster used an earlier Milvus GA version than the latest available GA version, you can choose the Milvus version for the restored cluster. By default, Zilliz Cloud restores the cluster to the latest GA Milvus version.

- For backup files created more than 30 days ago, or backup files already using the latest Milvus GA version, the target Milvus version cannot be changed.

For example, suppose the latest available Milvus GA version is 2.6.x.

- If you restore from a 2.5.x backup file created within the last 30 days, Zilliz Cloud restores the new cluster to 2.6.x by default, but you can choose to restore it to 2.5.x.

- If you restore from a 2.5.x backup file created more than 30 days ago, Zilliz Cloud restores the new cluster to 2.6.x by default, and you cannot change the target Milvus version.

- If you restore from a 2.6.x backup file, Zilliz Cloud restores the new cluster to 2.6.x, and you cannot change the target Milvus version.
