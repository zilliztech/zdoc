---
title: "Manage Projects | BYOC"
slug: /manage-projects
sidebar_label: "Projects"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In Zilliz Cloud, a project serves as a logical container within an organization, grouping clusters, volumes, and related resources. All resources within a project share the same cloud provider and region. | BYOC"
type: origin
token: NXypwJ2ySiv7RAkyKb5cZ9SKnvf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Manage Projects

In Zilliz Cloud, a project serves as a logical container within an organization, grouping clusters, volumes, and related resources. All resources within a project share the same cloud provider and region.

You can create multiple projects tailored to different aspects of your business. For example, if your company offers multimedia recommendation services, you can create one project for video recommendations and another for music recommendations.

In BYOC deployments, each project maps to a single Kubernetes cluster in one region. Cross-region operations are not supported. To operate in multiple regions, create separate BYOC projects.

This guide will walk you through the steps of managing projects.

## View all projects\{#view-all-projects}

You can view the list of all projects in your permission scope in the organization.

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

    ```bash
    {
        "code": 0,
        "data": [
            {
                "projectName": "Default Project",
                "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
                "regionIds": [
                    "aws-us-east-1"
                ],
                "instanceCount": 2,
                "createTime": "2023-08-16T07:34:06Z",
                "plan": "Enterprise",
                "orgType": "SAAS",
                "description": "A project for organizing clusters and resources."
            }
        ]
    }
    ```

- **Via web console**

    ![VnLHwjlDbhA62GbPXsYcIl6CnKb](https://zdoc-images.s3.us-west-2.amazonaws.com/VnLHwjlDbhA62GbPXsYcIl6CnKb.png)

## View project details\{#view-project-details}

You can also check the details of a certain project.

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
            "regionIds": [
                "aws-us-east-1"
            ],
            "instanceCount": 2,
            "createTime": "2023-08-16T07:34:06Z",
            "plan": "Enterprise",
            "orgType": "SAAS",
            "description": "A project for organizing clusters and resources."
        }
    }
    ```

- **Via web console**

    You can check the project name, plan, creation time, and the number of clusters within the project on the **Projects** page. You can further click on a certain project to view its clusters.

    ![HhfsbgOXco1fdGxoEYxc6QXBnpc](https://zdoc-images.s3.us-west-2.amazonaws.com/hhfsbgoxco1fdgxoeyxc6qxbnpc.png "HhfsbgOXco1fdGxoEYxc6QXBnpc")

## Edit project details\{#edit-project-details}

To rename a project or edit the description of a project, you must be an [Organization Owner](./organization-users). You can edit project details via the web console.

![rename-project-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/rename-project-byoc.png "rename-project-byoc")

## Delete a project\{#delete-a-project}

To delete a project, you must be an [Organization Owner](./organization-users). 

Before you delete a project, you must drop all [clusters](./manage-cluster#drop) within the project.

Once a project is deleted, all its associated data and resources will be irreversibly cleaned as well.

<Admonition type="info" icon="📘" title="📘 Notes">

The default project cannot be deleted.

</Admonition>

You can delete a project via the web console.

![delete-project-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/delete-project-byoc.png "delete-project-byoc")

