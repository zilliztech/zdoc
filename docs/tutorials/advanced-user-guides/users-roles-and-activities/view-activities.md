---
slug: /view-activities
sidebar_position: 8
---



# View Activities

The Zilliz Cloud **Activities** displays events that occurred for a given Zilliz Cloud [organization](./organizations-projects#organizations). These events include billing and access events and provide details about the state of your clusters.

## View activities{#view-activities}

You can view the activities at the organization level.

1. Enter the organization.

1. On the left navigation pane, click **Activities**. You can view the activity summary, the time when the activity occurred, and the operator of a specific activity.

![view-activities](/img/view-activities.png)

## Filter activities{#filter-activities}

You can filter the organization activities by type and time range. Try combining filtering conditions together for greater control over the output activity list.

- **Filter by time range**
    Select a start date and end date to view activities that occurred within a specified time range. Once you have set a time range, click **Apply** to view all the activities within the specified time range.

    :::info Notes    
    
    
    The time difference between the start date and the end date should be less than 30 days. 

    :::

    ![filter-by-time-range](/img/filter-by-time-range.png)

- **Filter by activity type**
    Select the activity type you want to see from the activity list. There are three types of activities in Zilliz Cloud: **Info**, **Warning**, and **Error**.

    |  **Activity Type** |  **Description**                                                                                                                                                          |
    | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  Info              |  General cluster, access or billing information.<br/> <br/>  Eg. Cluster in01-xxxxxxxxxxxxxxx was created.                                                                  |
    |  Warning           |  Resource state updates that require attention. <br/> <br/>  Eg. Cluster in01-xxxxxxxxxxxxxxx was deleted.                                                                  |
    |  Error             |  Payment failure or other system failures that require immediate attention or action. <br/> <br/>  Eg. The payment of the invoice invo-xxxxxxxxxxxxxxxxxxxxxxxx has failed. |

    ![filter-by-activity-type](/img/filter-by-activity-type.png)

## Related topics{#related-topics}

- [Organizations & Projects](./organizations-projects) 

- [Roles & Privileges](./roles-privileges) 

- [Add Organization Members](./add-organization-members) 

- [Remove Members](./remove-members) 

- [Manage Organization Information](./manage-organization-information) 

- [Delete Your Organization](./delete-your-organization) 

- [Delete Your Account](./delete-your-account) 

