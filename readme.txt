A thought experiment for improving user experience of long lists in SPAs etc

Thought process:

Lists of options and result sets are most usable when:
1) A reasonable size of results is visually presented at any one time (let's say 10 to 20)
2) The results appear fast (let's say under half a second)
3) The results are ordered in a meaningful fashion to the user

Putting aside number 3 my experience is that SPAs tend to fail on 1 and 2 as soon as the result set is more than say 20

A few reasons why:

1) Angular and other MV(VM/C) rendering is notoriously slow
2) Result sets are large and often sent down the line in one massive block which is then rendered complete
3) HTML generation and rendering is resource intensive and very blocking especially with lovely CSS etc
4) Promise driven (or even most AJAX) approaches are one time success fail deals
5) No one has as yet to my knowledge really addressed the relationship of Tasks and those Promises and the whole onprogress thing is a bit of a mess

So...

Why not create a more incremental approach of delivery results, a common interface that provides data in more manageable chunks regardless of their origin (local database querys, remote queries via xhr, FileSystem API queries in cordova, maybe even some websocket fun)?
Especially if the result set is of unknown 'non-finite' size and someone wants to play with Reactive extensions :-)

PS this code was written in a bivi in Cyprus on a solar powered tablet with no source control - so first commit is a lump with a failing test :-)

