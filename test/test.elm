view model =
    div [ class "wrapper", id "wrapper" ] [
        nav [ class "gNav", id "gNav" ] [
            ul [ class "gNav__list" ] [
                li [] [
                    a [ href "aaa.html" ] [
                        span [] [ text "link" ] ] ],
                li [] [
                    a [ href "aaa.html" ] [
                        span [] [ text "link link link" ] ] ],
                li [] [
                    a [ href "aaa.html" ] [
                        span [] [ text "link" ] ] ] ] ],
        table [ class "table_class" ] [
            tbody [] [
                tr [] [
                    td [ colspan 3, rowspan 3 ] [ text "td" ] ] ] ] ]
    
