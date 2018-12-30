view model =
    ul [ class "gNav__list" ] [
        li [] [
            text "文字",
            text "文字" ]
        li [] [
            text "文字",
            text "文字" ]
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
                span [] [ text "\"link\"" ] ] ],
        li [] [
            a [ href "aaa.html" ] [
                span [] [ text "link link link" ] ] ],
        li [] [
            a [ href "aaa.html" ] [ text "コメントじゃない" ] ],
        li [] [
            a [ href "aaa.html" ] [
                 ] ],
        div [] [] ]
