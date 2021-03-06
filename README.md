# 🎨 Splashcii

Splashcii is a simple command-line tool that queries and displays a random ascii art from [Asciiur](https://www.asciiur.com/)

## Install

Use your favorite package manager to install `splashcii`

```shell
$ npm install -g splashcii
...

$ yarn global add splashcii
...

$ pnpm add -g splashcii
...
```

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

![Doom Emacs](assets/doom-emacs.png)

```elisp
(defvar +fl/splashcii-query ""
  "The query to search on asciiur.com")

(defun +fl/splashcii-banner ()
  (mapc (lambda (line)
          (insert (propertize (+doom-dashboard--center +doom-dashboard--width line)
                              'face 'doom-dashboard-banner) " ")
          (insert "\n"))
        (split-string (with-output-to-string
                        (call-process "splashcii" nil standard-output nil +fl/splashcii-query))
                      "\n" t)))

(setq +doom-dashboard-ascii-banner-fn #'+fl/splashcii-banner)

(setq +fl/splashcii-query "christmas")
```
