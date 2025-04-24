exports.getTabProps = function (uid, parentProps, props) {
  const number = parentProps.tabs.findIndex(tab => tab.uid === uid.uid) + 1;
  return Object.assign({}, props, {
    number
  });
};

exports.decorateTab = function (Tab, { React }) {
  class SpanWithInput extends React.PureComponent {
      constructor(props) {
        super(props);
        // start with the existing tab label so we don't crash—
        // the input will still be hidden until you click
        this.state = {
            text: props.text || '',
        };
        this.changeTabName = this.changeTabName.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
    }

    // as soon as this tab appears and is active, open the rename input
    // componentDidMount() {
    //   if (this.props.isActive) {
    //     this.changeTabName();
    //   }
    // }

    // componentWillMount() {
    //     this.setState({ text: '' });
    // }

    componentDidUpdate(prevProps, prevState) {
      // If this tab just became active, show & focus the rename input
      if (!prevProps.isActive && this.props.isActive) {
        this.changeTabName();
      }

      const tabNameInput = document.querySelector(`.input${this.props.number}`);
      const tabName = document.querySelector(`.text${this.props.number}`);

      if (prevProps.isActive != this.props.isActive) {
        if (!this.props.isActive) {
          if (tabNameInput) {
            tabNameInput.style.display = 'none';
            tabName.style.display = 'inline';
          }
        }
      }
    }

    changeTabName() {
      const tabNameInput = document.querySelector(`.input${this.props.number}`);
      const tabName = document.querySelector(`.text${this.props.number}`);

      tabNameInput.style.display = 'inline';
      tabNameInput.style.caretColor = 'transparent';
      // Make the caret match the tab’s current text colour
      // (or replace 'inherit' with '#00ff00' if you always want neon-green)
      setTimeout(() => {
        // set cursor to the end of input
        tabNameInput.focus();
        var len = tabNameInput.value.length * 2;
        tabNameInput.setSelectionRange(len, len);
      }, 100);
      tabName.style.display = 'none';
    }

    onChange(e) {
      this.setState({
        [e.target.name]: e.target.value,
      });
    }

    onKeyPress(e) {
      const tabNameInput = document.querySelector(`.input${this.props.number}`);
      const tabName = document.querySelector(`.text${this.props.number}`);

      if (e.charCode == 13) {
        if (this.state.text == '') {
          // use old name is input value is empty
          this.setState({ text: this.props.text });
        }
        tabNameInput.style.display = 'none';
        tabName.style.display = 'inline';
      }
    }

    render() {
      const { text } = this.state;

      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'span',
          {
            className: `text${this.props.number} tab_text`,
            onClick: this.changeTabName,
          },
          text,
        ),
        React.createElement('input', {
          type: 'text',
          name: 'text',
          autoFocus: true,
          contentEditable: true,
          style: { display: 'none', caretColor: 'transparent' },
          className: `input${this.props.number} tab_input`,
          value: text.toString(),
          onKeyPress: this.onKeyPress,
          onChange: this.onChange,
          onClick: this.changeTabName,
          placeholder: '',
        }),
      );
    }
  }

  return class extends Tab {
    render() {
      return React.createElement(
        Tab,
        Object.assign({}, this.props, {
          text: React.createElement(SpanWithInput, {
            text: this.props.text,
            number: this.props.number,
          }),
        }),
      );
    }
  };
};

exports.decorateConfig = function (config) {
  return Object.assign({}, config, {
    css: `
        ${config.css || ''}

        .tab_text {
            cursor: pointer;
        }

        .tab_input {
          background: rgba(0,0,0,0);
          color: #cccccc;
          border: none;
          padding: .1em;
          font-size: 1em;
          text-align: center;
          caret-color: inherit;
        }
        .tab_input:focus{
          outline:none;
        }
        .tabs_nav .tab_tab .tab_text {
         border-right: none !important;
        }
        /* Fake neon-green caret that shows only when the input has focus */
        .tabs_nav .tab_tab .tab_input:focus::after {
          content: '';
          position: absolute;
          right: 4px;              /* tweak if you want it flush against the text */
          top: 15%;                /* vertically centre inside the tab */
          bottom: 15%;
          width: 2px;              /* caret thickness */
          background: #00ff00;     /* neon green */
          animation: blink 1s steps(1) infinite;
        }

        @keyframes blink {
          0%,50% { opacity: 1; }
          50.01%,100% { opacity: 0; }
        }
      `,
  });
};
