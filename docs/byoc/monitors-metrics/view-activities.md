---
slug: /docs/byoc/view-activities
beta: FALSE
notebook: FALSE
sidebar_position: 8
---

import Admonition from '@theme/Admonition';


# View Activities

The Zilliz Cloud **Activities** feature provides a comprehensive view of events associated with a specific Zilliz Cloud organization, encompassing both billing and access events, and delivering insightful details about the status of your clusters.

## View activities{#view-activities}

You can access and review the activities at the organization level through the following steps:

1. Navigate into the desired organization.

1. Click on **Activities** in the left navigation pane. Here, you will be able to see a summary of activities, the precise time each activity took place, and the identity of the operator involved in a specific activity.

![view-activities](/byoc/view-activities.png)

## Filter activities{#filter-activities}

To enhance your control and ease in navigating through the organization activities, you can apply filters by type and time range. Utilizing a combination of these filtering conditions provides a more tailored view of the activity list.

- **Filter by time range**
    Choose a start and end date to display activities occurring within a specific time frame. After setting your desired time range, click **Apply** to view all activities within this period.

    <Admonition type="info" icon="📘" title="Notes">    
    
    
    Ensure that the time span between your chosen start date and end date does not exceed 30 days.

    </Admonition>

    ![filter-by-time-range](/byoc/filter-by-time-range.png)

- **Filter by activity type**
    Select your preferred activity type from the activity list. Zilliz Cloud categorizes activities into three types: **Info**, **Warning**, and **Error**.

    |  **Activity Type** |  **Description**                                                                                                                                                                                  |
    | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  Info              |  General information related to clusters, access, or billing. <br/> <br/>  Eg. Cluster in01-xxxxxxxxxxxxxxx was created.                                                                            |
    |  Warning           |  Updates regarding resource states that necessitate your attention.<br/> <br/>   E.g., "Cluster in01-xxxxxxxxxxxxxxx was deleted."                                                                  |
    |  Error             |  Notifications of payment failures or other system malfunctions requiring immediate attention or action. <br/> <br/>  E.g., "The payment for the invoice invo-xxxxxxxxxxxxxxxxxxxxxxxx has failed." |

    ![filter-by-activity-type](/byoc/filter-by-activity-type.png)

## Related topics{#related-topics}

- [Manage Organization Information](./manage-orgs-and-members)

- [Delete Your Account](./delete-your-account) 

