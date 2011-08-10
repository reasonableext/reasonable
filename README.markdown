reasonable
==========

Introduction
------------

Designed to make your commingling with the cosmotarian commentariat at
[reason.com](http://www.reason.com/) a marginally more enjoyable experience.

### Features

* Blacklist trolls and blogwhores. Recommendations are made automatically from
  an online list, and there's an ignore button when reading posts.
* Display delicious alt text directly underneath images. Also, for larger
  images you can click on them and view it full screen without leaving the page.
* In threaded comments, toggle between showing all replies and direct replies
* See YouTube videos and images in posts
* Store the hyperlinks to recent comments you've made for easier access
* See Gravatar/Identicon avatars
* Improve load times by removing the Facebook and Twitter sharing APIs
* Links to quickly insert HTML into comment forms

### Permissions requested

The extension asks for "access to your data on brymck.com," which is for
updating the list of trolls and nothing else. You can turn off whether you
receive (to make troll detection hands-off) or send (to make the automated
troll list more democratic) any info. Information on your tabs (i.e. your
"browsing history") is necessary to display the icon whenever you visit a page
where the extension is active. I store zero personal or identifying information
on folks using this extension.

### Source

https://github.com/brymck/reasonable

Feel free to send me feedback here, there or anywhere else.

Installation
------------

The recommend way to install is through the Chrome Web Store page. [Chrome Web Store](https://chrome.google.com/webstore/detail/fdbllkbadgaglaalokapjlkcagidcndj) page. Chrome
extensions will automatically update to the latest stable version.

If you'd like to use the "compiled" source (HTML/CSS/JavaScript), you can check
in the [`ext`](https://github.com/brymck/reasonable/tree/master/ext) directory.
Although the HTML, JS and CSS are all compiled, the results are pretty-printed.

If you'd like to compile from the source, you'll need the following:

* [Ruby](http://www.ruby-lang.org/en/)
  * [HAML](http://haml-lang.com/)
  * [RedCloth](http://redcloth.org/)
  * [SASS](http://sass-lang.com/)
* [Node.js](http://nodejs.org/)
  * [CoffeeScript](http://jashkenas.github.com/coffee-script/)

Once those are installed, you should be able to just clone the repo and install
using `cake`:

    git clone git@github.com:brymck/reasonable.git
    cd reasonable
    cake build
