# GOTY

## Requirements

-   Customize game list(Has all of the games from this year?)
-   Search GB?
-   "Recommended" list?
-   Can we pull steam gameplay data?
-   Users / login
-   Save progress
-   Usable by Tom's coworkers

## Enhancements

-   Select/Deselect games by platform.
-   Pull data from other sources (eg steam, xbox gameplay stats)
-   Final List is customisable
-   Show users info about the games
-   Telemetry

## Telemetry

-   Result List (+ Score???)
-   Any customisations made.

## Terminology

-   List: the games that the user has played
-   Result: the GOTY list, ordered.
-   Final List: Result + User Edits.

# Steps

-   Identify played games
-   Sort games
-   Edit list

# APIs

-   Login with google
-   On user creation, populate list with initial default list
-   Reset user progress ("start over")
-   Get list for current user
    {
    list: details[], (includes "has played")
    }
-   Add item to list for current user
-   Set has played true/false for game for current user
-   Search GB games
    query: text
-   choose between two games (Will update list on DB and/or Result on last comparison)
-   Returns current list status.
-   Get next comparison
-   Save result ("finish comparison")
-   Get result
-   Update result(order)
