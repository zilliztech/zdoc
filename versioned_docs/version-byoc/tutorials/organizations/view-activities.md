---
title: "View Activities | BYOC"
slug: /view-activities
sidebar_label: "View Activities"
beta: FALSE
notebook: FALSE
description: "The Zilliz Cloud Activities feature provides a comprehensive view of events associated with a specific Zilliz Cloud organization, encompassing  access events. | BYOC"
type: origin
token: NeUWwqRl2iwn4HkZg3ocjLjmnth
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - activities
  - view
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search

---

import Admonition from '@theme/Admonition';


# View Activities

The Zilliz Cloud **Activities** feature provides a comprehensive view of events associated with a specific Zilliz Cloud organization, encompassing  access events.

## View activities{#view-activities}

On the organization page, click **Activities** in the left navigation pane. Here, you can view a summary of activities, the time when each activity took place, and the identity of the operator involved in a specific activity.

![view-activities-byoc](/img/view-activities-byoc.png)

## Filter activities{#filter-activities}

To enhance your control and ease in navigating through the organization activities, you can apply filters by type and time range. Utilizing a combination of these filtering conditions provides a more tailored view of the activity list.

- **Filter by time range**

    Choose a start and end date to display activities occurring within a specific time frame. After setting your desired time range, click **Apply** to view all activities within this period.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Ensure that the time span between your chosen start date and end date does not exceed 30 days.</p>

    </Admonition>

    ![filter-by-time-range](/img/filter-by-time-range.png)

- **Filter by activity type**

    Select your preferred activity type from the activity list. Zilliz Cloud categorizes activities into three types: **Info**, **Warning**, and **Error**.

    <table>
       <tr>
         <th><p><strong>Activity Type</strong></p></th>
         <th><p><strong>Description</strong></p></th>
       </tr>
       <tr>
         <td><p>Info</p></td>
         <td><p>General information related to clusters, access, or billing. </p><p>Eg. Cluster in01-xxxxxxxxxxxxxxx was created.</p></td>
       </tr>
       <tr>
         <td><p>Warning</p></td>
         <td><p>Updates regarding resource states that necessitate your attention.</p><p>E.g., "Cluster in01-xxxxxxxxxxxxxxx was deleted."</p></td>
       </tr>
       <tr>
         <td><p>Error</p></td>
         <td><p>Notifications of payment failures or other system malfunctions requiring immediate attention or action. </p><p>E.g., "The payment for the invoice invo-xxxxxxxxxxxxxxxxxxxxxxxx has failed."</p></td>
       </tr>
    </table>

    ![filter-by-activity-type](/img/filter-by-activity-type.png)

- **Filter by activity**

    ![filter-by-activity](/img/filter-by-activity.png)

