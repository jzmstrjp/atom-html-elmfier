view model =
    div [ class "wrapper", id "wrapper" ] [
        text "This is the beginning.",
        nav [ class "gNav", id "gNav" ] [
            ul [ class "gNav__list" ] [
                li [] [
                    div [] [ text "<>& \"\'" ] ],
                li [] [
                    a [ href "aaa.html" ] [
                        span [] [ text "link\"li nk\'link" ] ] ],
                li [] [
                    a [ href "aaa.html" ] [
                        span [] [ text "link\"li nk\'link" ] ] ],
                li [] [
                    a [ href "aaa.html" ] [
                        span [] [ text "link link link" ] ] ],
                li [] [
                    a [ href "aaa.html" ] [
                        span [] [ text "link" ] ] ] ] ],
        text "When",
        b [] [ text "you" ],
        text "gaze into the",
        b [] [ text "abyss" ],
        text ",",
        br [] [],
        text "the",
        b [] [ text "abyss" ],
        text "gazes into",
        b [] [ text "you" ],
        text ".",
        table [ class "table_class" ] [
            tbody [] [
                tr [] [
                    td [ colspan 3, rowspan 3 ] [ text "td" ] ] ] ],
        input [ type_ "button", value "-" ] [],
        div [] [ text "0" ],
        input [ type_ "button", value "+" ] [] ]
