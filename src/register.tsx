import app, {Component} from 'apprun';

export default class registerComponent extends Component {
  state = {
    messages: []
  }

  view = (state) => {
    return <div className="auth-page">
      <div className="container page">
        <div className="row">

          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign up</h1>
            <p className="text-xs-center">
              <a href="#signin">Have an account?</a>
            </p>

            {state.messages && <ul className="error-messages">
              {state.messages.map(message =>
                <li>{message}</li>
              )}
            </ul>}

            <form onsubmit={e => app.run('register', e)}>
              <fieldset className="form-group">
                <input className="form-control form-control-lg" type="text" placeholder="Your Name" name="username"/>
              </fieldset>
              <fieldset className="form-group">
                <input className="form-control form-control-lg" type="text" placeholder="Email" name="email"/>
              </fieldset>
              <fieldset className="form-group">
                <input className="form-control form-control-lg" type="password" placeholder="Password" name="password"/>
              </fieldset>
              <button className="btn btn-lg btn-primary pull-xs-right">
                Sign up
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  }

  update = {
    '#register': (state, messages) => ({ ...state, messages })
  }
}

