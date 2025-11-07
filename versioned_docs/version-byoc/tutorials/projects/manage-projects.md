---
title: "Manage Projects | BYOC"
slug: /manage-projects
sidebar_label: "Projects"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In Zilliz Cloud, a project serves as a logical container within an organization, grouping clusters and related resources. You can create multiple projects tailored to different aspects of your business. For example, if your company offers multimedia recommendation services, you can create one project for video recommendations and another for music recommendations. | BYOC"
type: origin
token: NXypwJ2ySiv7RAkyKb5cZ9SKnvf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - projects
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus

---

import Admonition from '@theme/Admonition';


# Manage Projects

In Zilliz Cloud, a project serves as a logical container within an organization, grouping clusters and related resources. You can create multiple projects tailored to different aspects of your business. For example, if your company offers multimedia recommendation services, you can create one project for video recommendations and another for music recommendations.

This guide will walk you through the steps of managing projects.

## View all projects\{#view-all-projects}

You can view the list of all projects in your permission scope in the organization.

- **Via web console**

    ![view-projects-byoc](/img/view-projects-byoc.png)

- **Via RESTful API**

    The following example shows how to list all projects in the current organization. For details, see [List Projects](/reference/restful/list-projects-v2).

    ```bash
    export TOKEN="YOUR_API_KEY"
    
    curl --request GET \
    --url "${BASE_URL}/v2/projects" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json"
    ```

    The following is an example output.

    ```json
    {
        "code": 0,
        "data": [
            {
                "projectName": "Default Project",
                "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
                "instanceCount": 2,
                "createTime": "2023-08-16T07:34:06Z",
                "plan": "Enterprise"
            }
        ]
    }
    ```

## View project details\{#view-project-details}

You can also check the details of a certain project.

- **Via web console**

    You can check the project name, plan, creation time, and the number of clusters within the project on the **Projects** page. You can further click on a certain project to view its clusters.

    ![NoSTbfMVjoPp99x5cjcc0cwWnbd](/img/NoSTbfMVjoPp99x5cjcc0cwWnbd.png)

- **Via RESTful API**

    The following example describes the project `proj-xxxxxxxxxxxxxxx`. For details, see [Describe Project](/reference/restful/describe-project-v2).

    ```bash
    export TOKEN="YOUR_API_KEY"
    export projectId="proj-xx"
    
    curl --request GET \
    --url "${BASE_URL}/v2/projects/${projectId}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    ```

    The following is an example output

    ```json
    {
        "code": 0,
        "data": {
            "projectId": "proj-x",
            "projectName": "My Project",
            "instanceCount": 2,
            "createTime": "2023-08-16T07:34:06Z",
            "plan": "Enterprise"
        }
    }
    ```

## Rename a project\{#rename-a-project}

To rename a project, you must be an [Organization Owner](./organization-users). You can rename a project via the web console.

![rename-project-byoc](/img/rename-project-byoc.png)

## Delete a project\{#delete-a-project}

To delete a project, you must be an [Organization Owner](./organization-users). 

Once a project is deleted, all its associated data and resources will be irreversibly cleaned as well.

<Admonition type="info" icon="📘" title="Notes">

<p>The default project cannot be deleted.</p>

</Admonition>

You can delete a project via the web console.

![delete-project-byoc](/img/delete-project-byoc.png)

