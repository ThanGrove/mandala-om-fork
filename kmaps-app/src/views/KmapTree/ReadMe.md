# Kmap Tree Components

This folder contains several components used for creating a KMap Tree. Most of them are used internally in the
main component, which is KmapTree. This is the component used to create the various versions of the tree based on its settings.
The descriptions of the settings for the KmapTree component can be found in that file itself.
The other components here are either versions of the tree or of the children in the tree. In this module,
nodes of the tree are called "leaves". A "LeafGroup" is a top-level component used when a tree, such as subjects
has multiple "roots".

The components contained in this module are:

-   FilterTree: A tree filtered by project (projects_ss value in Solr doc)
-   LeafGroup: The initial component for Subjects and Terms trees that have multiple top-level roots
-   LeafChildren: A component containing the children of a leaf node, only added when the node is "opened" to implement lazy loading
-   RelatedChildren: A variant of LeafChildren, that only shows related places from the list of child documents
-   TreeLeaf: A basic leaf node in any tree. Keeps state on whether open or closed and added LeafChilden if open.
-   KmapPerspectives: Components and data for displaying perspectives
