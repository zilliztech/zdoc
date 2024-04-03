---
slug: /view-activities
beta: FALSE
notebook: FALSE
type: origin
token: UfqGwAVleiNu7FkH28JcnlgOnpf
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# View Activities

The Zilliz Cloud __Activities__ feature provides a comprehensive view of events associated with a specific Zilliz Cloud organization, encompassing  access events.

## View activities{#view-activities}

On the organization page, click __Activities__ in the left navigation pane. Here, you can view a summary of activities, the time when each activity took place, and the identity of the operator involved in a specific activity.

![view-activities-byoc](/byoc/view-activities-byoc.png)

## Filter activities{#filter-activities}

To enhance your control and ease in navigating through the organization activities, you can apply filters by type and time range. Utilizing a combination of these filtering conditions provides a more tailored view of the activity list.

- __Filter by time range__

    Choose a start and end date to display activities occurring within a specific time frame. After setting your desired time range, click __Apply__ to view all activities within this period.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Ensure that the time span between your chosen start date and end date does not exceed 30 days.</p>

    </Admonition>

    ![filter-by-time-range](/byoc/filter-by-time-range.png)

- __Filter by activity type__

    Select your preferred activity type from the activity list. Zilliz Cloud categorizes activities into three types: __Info__, __Warning__, and __Error__.

    |  __Activity Type__ |  __Description__                                                                                                                                                                                |
    | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  Info              |  General information related to clusters, access, or billing. <br/> Eg. Cluster in01-xxxxxxxxxxxxxxx was created.                                                                            |
    |  Warning           |  Updates regarding resource states that necessitate your attention.<br/>  E.g., "Cluster in01-xxxxxxxxxxxxxxx was deleted."                                                                  |
    |  Error             |  Notifications of payment failures or other system malfunctions requiring immediate attention or action. <br/> E.g., "The payment for the invoice invo-xxxxxxxxxxxxxxxxxxxxxxxx has failed." |

    ![filter-by-activity-type](/byoc/filter-by-activity-type.png)

## Related topics{#related-topics}

- [Manage Organization Information](./organizations)

- [Delete Your Account](./email-accounts)

