---
title: "View Platform Audit Logs | BYOC"
slug: /view-activities
sidebar_label: "View Platform Audit Logs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The Zilliz Cloud Platform Audit Logs feature provides a comprehensive view of logs associated with a specific Zilliz Cloud organization, encompassing  access logs. | BYOC"
type: origin
token: NeUWwqRl2iwn4HkZg3ocjLjmnth
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# View Platform Audit Logs

The Zilliz Cloud **Platform Audit Logs** feature provides a comprehensive view of logs associated with a specific Zilliz Cloud organization, encompassing  access logs.

## View platform audit logs\{#view-platform-audit-logs}

On the organization page, click **Platform Audit Logs** in the left navigation pane. Here, you can view a summary of platform logs, the time when each log was recorded, and the identity of the operator involved.

![view-activities-saas](https://zdoc-images.s3.us-west-2.amazonaws.com/view-activities-saas.png "view-activities-saas")

## Filter platform audit logs\{#filter-platform-audit-logs}

To enhance your control and ease in navigating through the platform audit logs, you can apply filters by type and time range. Utilizing a combination of these filtering conditions provides a more tailored view.

- **Filter by time range**

    Choose a start and end date to display logs occurring within a specific time frame. After setting your desired time range, click **Apply** to view all logs within this period.

    <Admonition type="info" icon="📘" title="Notes">

    Ensure that the time span between your chosen start date and end date does not exceed 30 days.

    </Admonition>

    ![filter-by-time-range](https://zdoc-images.s3.us-west-2.amazonaws.com/filter-by-time-range.png "filter-by-time-range")

- **Filter by type**

    Select your preferred log type from the list. Zilliz Cloud categorizes platform audit logs into three types: **Info**, **Warning**, and **Error**.

    | **Activity Type** | **Description** |
    | --- | --- |
    | Info | General information related to clusters, access, or billing.<br/>Eg. Cluster inxx-xxxxxxxxxxxxxxx was created. |
    | Warning | Updates regarding resource states that necessitate your attention.<br/>E.g., "Cluster inxx-xxxxxxxxxxxxxxx was deleted." |
    | Error | Notifications of payment failures or other system malfunctions requiring immediate attention or action.<br/>E.g., "The payment for the invoice invo-xxxxxxxxxxxxxxxxxxxxxxxx has failed." |

    ![filter-by-activity-type](https://zdoc-images.s3.us-west-2.amazonaws.com/filter-by-activity-type.png "filter-by-activity-type")

- **Filter by audit log**

    ![filter-by-activity](https://zdoc-images.s3.us-west-2.amazonaws.com/filter-by-activity.png "filter-by-activity")

