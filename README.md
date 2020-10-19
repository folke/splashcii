# 🎨 Splashcii

Splashcii is a simple command-line tool that queries and displays a random ascii art from [Asciiur](https://www.asciiur.com/)

## Usage

```shell
$ splashcii halloween
 .-.
(o o) boo!
| O \
 \   \
  `~~~'
```

Query results are cached, so they're only fetched once, the first time you search for a certain keyword.

## Doom Emacs Banner

Example to use a random **halloween** ascii-art for your doom banner. Make sure `splascii` is on your path.

```elisp
(defvar +fl/splashcii-query ""
  "The query to search on asciiur.com")

(defun +fl/splashcii ()
  (split-string (with-output-to-string
                  (call-process "splashcii" nil standard-output nil +fl/splashcii-query))
                "\n" t))

(defun +fl/doom-banner ()
  (let ((point (point)))
    (mapc (lambda (line)
            (insert (propertize (+doom-dashboard--center +doom-dashboard--width line)
                                'face 'doom-dashboard-banner) " ")
            (insert "\n"))
          (+fl/splashcii))
    (insert (make-string (or (cdr +doom-dashboard-banner-padding) 0) ?\n))))

;; override the first doom dashboard function
(setcar (nthcdr 0 +doom-dashboard-functions) #'+fl/doom-banner)

(setq +fl/splashcii-query "halloween")
```