<script>
  import { createEventDispatcher } from 'svelte';
  import Paper from 'scattered-papers/Paper.svelte';
  import Content from 'scattered-papers/Content.svelte';

  const dispatch = createEventDispatcher();

  export let note;
  export let top;
  export let i;

  const findParent = (Class, element) => {
    if (!element) { return null; }
    if (element instanceof Class) { return element; }
    return findParent(Class, element.parentElement);
  }

  function click(event) {
    console.log(event);
    const { target } = event;
    const parentAnchor = findParent(HTMLAnchorElement, target);
    if (parentAnchor) {
      const href = parentAnchor.getAttribute('href');
      if (href.startsWith('./') && href.endsWith('.md')) {
        event.preventDefault();
        dispatch('navigate', href.slice(2));
      }
    } else {
      dispatch('focus', note);
    }
  }
</script>

<div class:top class='note'>
  <Paper>
    <div class:top class='content' on:click={click}>
      <Content>
        {@html note.content}
      </Content>
    </div>
  </Paper>
</div>

<style>
  .note {
    position: relative;
    margin: 1rem auto;
    width: 60rem;
    font-size: 1.15rem;
    font-variant-numeric: proportional-nums;
    max-height: 80vh;

    --font-sub-display: 'Vollkorn SC', sans-serif;
    --font-size-title: 1.75em;
    --font-size-subtitle: 1.1em;
    --font-size-heading: 1.25em;
    --font-size-subheading: 1.05em;
    --font-size-body: 1em;
    --font-size-note: 0.9em;

    --color__code--black: #282C34;
    --color__code--brblack: #3E4452;
    --color__code--red: #E06C75;
    --color__code--brred: #BE5046;
    --color__code--green: #98C378;
    --color__code--brgreen: #98C379;
    --color__code--yellow: #E5C07B;
    --color__code--bryellow: #D19A66;
    --color__code--blue: #61AFEF;
    --color__code--brblue: #61AFEF;
    --color__code--magenta: #C678DD;
    --color__code--brmagenta: #C678DD;
    --color__code--cyan: #56B6C2;
    --color__code--brcyan: #56B6C2;
    --color__code--white: #ABB2BF;
    --color__code--brwhite: #5C6370;

    --color__code--background: var(--color__code--black);
    --color__code--text: var(--color__code--white);

    --Content--outer-space: 4rem;
  }

  .content {
    max-height: 80vh;
    overflow-y: hidden;
  }

  .content.top {
    overflow-y: auto;
  }

  .content :global(h1) {
    /* a bit of a hack, because I don't want to mess with the h1 of the blog */
    margin-left: 4rem;
  }

  .content :global(a[href^='./']) {
    /* The tag links are of this form, and should be styled slightly differently */
    text-decoration: underline;
    text-decoration-style: dotted;
  }

  .content:not(.top) :global(a[href^='./']) {
    pointer-events: none;
  }
</style>
