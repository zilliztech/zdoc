---
slug: /view-activities
beta: FALSE
notebook: FALSE
type: origin
token: UfqGwAVleiNu7FkH28JcnlgOnpf
sidebar_position: 4

---

import Admonition from '@theme/Admonition';


# View Activities

The Zilliz Cloud **Activities** feature provides a comprehensive view of events associated with a specific Zilliz Cloud organization, encompassing billing and  access events.

## View activities{#view-activities}

On the organization page, click **Activities** in the left navigation pane. Here, you can view a summary of activities, the time when each activity took place, and the identity of the operator involved in a specific activity.

![view-activities-saas](/img/view-activities-saas.png)

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
         <th><strong>Activity Type</strong></th>
         <th><strong>Description</strong></th>
       </tr>
       <tr>
         <td>Info</td>
         <td>General information related to clusters, access, or billing. <br/> Eg. Cluster in01-xxxxxxxxxxxxxxx was created.</td>
       </tr>
       <tr>
         <td>Warning</td>
         <td>Updates regarding resource states that necessitate your attention.<br/>  E.g., "Cluster in01-xxxxxxxxxxxxxxx was deleted."</td>
       </tr>
       <tr>
         <td>Error</td>
         <td>Notifications of payment failures or other system malfunctions requiring immediate attention or action. <br/> E.g., "The payment for the invoice invo-xxxxxxxxxxxxxxxxxxxxxxxx has failed."</td>
       </tr>
    </table>

    ![filter-by-activity-type](/img/filter-by-activity-type.png)

## Related topics{#related-topics}

- [Manage Organization Information](./organizations)

- [Delete Your Organization](./delete-your-organization)

- [Delete Your Account](./email-accounts)

