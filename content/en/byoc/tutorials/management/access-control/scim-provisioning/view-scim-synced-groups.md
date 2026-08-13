---
title: "View SCIM-Synced Groups | BYOC"
slug: /view-scim-synced-groups
sidebar_label: "View SCIM-Synced Groups"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "After SCIM provisioning is configured, groups provisioned from your identity provider (IdP) appear in Zilliz Cloud as synced groups. You can view these groups in Access Control. | BYOC"
type: origin
token: Er7Yw6Qnuiy8CBkDkH3cetOHnDf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# View SCIM-Synced Groups

After SCIM provisioning is configured, groups provisioned from your identity provider (IdP) appear in Zilliz Cloud as synced groups. You can view these groups in Access Control.

SCIM-synced groups are read-only in Zilliz Cloud. You cannot create a SCIM-synced group directly in Zilliz Cloud, add or invite users to it, or change its membership. Manage group names, membership, and lifecycle in your IdP. The IdP then synchronizes those changes to Zilliz Cloud through SCIM.

## Before you start\{#before-you-start}

- You have reviewed [SCIM Provisioning Overview](/docs/scim-provisioning) and configured SCIM provisioning for your Zilliz Cloud organization.

- Your IdP has provisioned at least one group to Zilliz Cloud.

## View synced groups\{#view-synced-groups}

The following interactive demo shows how to open the list of SCIM-synced groups in Zilliz Cloud:

<Supademo id="cmseasko70twvqm25bstzowox" title=""  />

<Procedures>

1. In the left-side navigation pane, click **Access Control**.

1. Open the **Groups** tab.

1. Verify that the groups provisioned from your IdP appear in the group list.

</Procedures>