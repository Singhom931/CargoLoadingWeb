from flask import render_template, redirect, url_for, flash, request, session, jsonify, copy_current_request_context
from ..extensions import db, User, Reference, Container, Cargo, cache
from . import main
from .packer import Pack
import json


@main.route('/')
def index():
    return render_template('main/home.html')

@main.route('/guest')
def guest():
    session['email'] = "guest"
    return redirect(url_for('main.tools'))

@main.route('/tools', methods=['GET', 'POST'])
def tools():
    if request.method == 'POST':
        tool = request.form.get("tool")
        valid_tools = {
        "world-map": "world-map.html",
        "3d-load": redirect(url_for('main.reference')),
        "co2": "co2.html",
        "sea-route": "sea-route.html",
        "road-route": "road-route.html"
        }
        if tool in valid_tools:
            return valid_tools[tool]
    
    return render_template('main/tools.html')

@main.route('/reference', methods=['GET', 'POST'])
def reference():
    if request.method == 'POST':
        session['reference'] = request.form['ref-name']
        existing_reference = Reference.query.filter_by(email=session['email'], reference=session['reference']).first()
        if existing_reference:
            session['existing_reference'] = True
        else:
            session['existing_reference'] = False
            new_reference = Reference(email=session['email'], reference=session['reference'])
            db.session.add(new_reference)
            db.session.commit()
        return redirect(url_for('main.cargo'))
    return render_template('main/reference.html')

@main.route('/cargo', methods=['GET', 'POST'])
def cargo():
    return render_template('main/cargo.html', existing_reference=session['existing_reference'])

@main.route('/submit_cargo', methods=['GET', 'POST'])
def submit_cargo():
    if request.method == 'POST':
        cargo_data = request.get_json()['cargo']

        Cargo.query.filter_by(email=session['email'], reference=session['reference']).delete()

        for cargo in cargo_data:
            new_cargo = Cargo(email=session['email'],  
                reference=session['reference'],
                name=cargo.get('name'),
                length=cargo.get('length'),
                width=cargo.get('width'),
                height=cargo.get('height'),
                weight=cargo.get('weight'),
                quantity=cargo.get('quantity'),
                color=cargo.get('color'),
                rotate=cargo.get('rotate'),
                loadbearing=cargo.get('loadbearing'),
            )
            db.session.add(new_cargo)
        db.session.commit()
    return jsonify({'message': 'Cargo data submitted successfully!'}), 200

@main.route('/fetch_cargo', methods=['GET'])
def fetch_cargo():
    email = session['email']
    reference = session['reference']
    
    # Query the database for cargo data using the email and reference
    cargo_data = Cargo.query.filter_by(email=email, reference=reference).all()
    
    # Convert database records to JSON format
    cargo_list = [{
        'name': cargo.name,
        'length': cargo.length,
        'width': cargo.width,
        'height': cargo.height,
        'weight': cargo.weight,
        'quantity': cargo.quantity,
        'total_weight': cargo.weight * cargo.quantity,  
        'volume': cargo.length * cargo.width * cargo.height, 
        'color': cargo.color,
        'rotate': cargo.rotate,
        'loadbearing': cargo.loadbearing
    } for cargo in cargo_data]
    
    return jsonify({'cargo': cargo_list}), 200


@main.route('/container', methods=['GET', 'POST'])
def container():
    return render_template('main/container.html', existing_reference=session['existing_reference'])

@main.route('/submit_container', methods=['GET', 'POST'])
def submit_container():
    if request.method == 'POST':
        container_data = request.get_json()['container']

        Container.query.filter_by(email=session['email'], reference=session['reference']).delete()

        for container in container_data:
            new_container = Container(email=session['email'],  
                reference=session['reference'],
                name=container.get('name'),
                length=container.get('length'),
                width=container.get('width'),
                height=container.get('height'),
                weight_capacity=container.get('max_weight')
            )
            db.session.add(new_container)
        db.session.commit()
    return jsonify({'message': 'Container data submitted successfully!'}), 200

@main.route('/fetch_container', methods=['GET'])
def fetch_container():
    email = session['email']
    reference = session['reference']
    
    # Query the database for container data using the email and reference
    container_data = Container.query.filter_by(email=email, reference=reference).all()
    
    # Convert database records to JSON format
    container_list = [{
        'name': container.name,
        'length': container.length,
        'width': container.width,
        'height': container.height,
        'max_weight': container.weight_capacity
    } for container in container_data]
    
    return jsonify({'containers': container_list}), 200


@main.route('/load_output', methods=['GET', 'POST'])
def load_output():
    session['task_complete'] = False
    session['task_in_progress'] = False
    cache.clear()
    return render_template('main/loading_output.html', loading=True)


@main.route('/check_output_status', methods=['GET'])
def check_output_status():
    if session.get('task_in_progress',False):
        return jsonify({'status': 'pending'})
    else:
        session['task_in_progress'] = True
        cargo_data = Cargo.query.filter_by(email=session['email'], reference=session['reference']).all()
        container_data = Container.query.filter_by(email=session['email'], reference=session['reference']).all()
        import cProfile
        import pstats
        pr = cProfile.Profile()
        pr.enable()
        plots_list, plots_3d, gravity, volume_usage, weight_usage = Pack(cargo_data,container_data)
        pr.disable()
        # pr.print_stats(sort='time')
        with open("profile_output.txt", "w") as f:
            stats = pstats.Stats(pr, stream=f)
            stats.strip_dirs()  # Optional: cleans up filenames in output
            stats.sort_stats("cumulative")  # Sorts the output by cumulative time
            stats.print_stats()


        # Store data in cache (using session['email'] and session['reference'] as keys)
        cache.set(f"{session['email']}_{session['reference']}_plots_list", plots_list)
        cache.set(f"{session['email']}_{session['reference']}_plots_3d", plots_3d)
        cache.set(f"{session['email']}_{session['reference']}_gravity", gravity)
        cache.set(f"{session['email']}_{session['reference']}_volume_usage", volume_usage)
        cache.set(f"{session['email']}_{session['reference']}_weight_usage", weight_usage)
        
        session['task_complete'] = True

    if session.get('task_complete', False):
        # Task is complete, return success response
        return jsonify({'status': 'complete'})


@main.route('/output', methods=['GET', 'POST'])
def output():
    plots_list = cache.get(f"{session['email']}_{session['reference']}_plots_list")
    plots_3d = cache.get(f"{session['email']}_{session['reference']}_plots_3d")
    gravity = cache.get(f"{session['email']}_{session['reference']}_gravity")
    volume_usage = cache.get(f"{session['email']}_{session['reference']}_volume_usage")
    weight_usage = cache.get(f"{session['email']}_{session['reference']}_weight_usage")
    # print(plots_list)
    # print(plots_3d)
    print(gravity)

    return render_template('main/output.html',plots_list=plots_list, plots_3d=plots_3d, gravity=gravity, volume_usage=volume_usage, weight_usage=weight_usage)

@main.route('/wham', methods=['GET', 'POST'])
def wham():
    return render_template('main/swagshot.html')

